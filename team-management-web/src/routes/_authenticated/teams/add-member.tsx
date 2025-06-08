import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { teamClient } from "@/lib/team-client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  role: z.number({ required_error: "Role is required" }),
});

const addMemberSearchParamsSchema = z.object({
  teamId: z.string(),
});

type AddMemberSearchParams = z.infer<typeof addMemberSearchParamsSchema>;

export const Route = createFileRoute("/_authenticated/teams/add-member")({
  validateSearch: (search: Record<string, unknown> | undefined): AddMemberSearchParams => {
    if (!search) return { teamId: "0" };
    const parsed = addMemberSearchParamsSchema.safeParse(search);
    if (!parsed.success) {
      return { teamId: "0" };
    }
    return parsed.data;
  },
  component: AddMemberPage,
});

function AddMemberPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_authenticated/teams/add-member" }) as AddMemberSearchParams;
  const teamId = Number(search.teamId);

  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ["team-roles"],
    queryFn: teamClient.getTeamRoles,
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: undefined as undefined | number,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (value: string) => {
    setForm((prev) => ({ ...prev, role: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of parsed.error.errors) {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      if (form.role === undefined) {
        setErrors((prev) => ({ ...prev, role: "Role is required" }));
        setLoading(false);
        return;
      }
      await teamClient.addTeamMember({
        team: teamId,
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        phone_number: form.phone,
        role: form.role,
      });
      toast.success("Team member invited!");
      navigate({ to: "/teams/$teamId", params: { teamId: teamId.toString() } });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to add team member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <Card className="max-w-md mx-auto p-8 border border-gray-200 rounded-lg">
        <div className="text-xl font-semibold mb-1">Add a team member</div>
        <div className="text-gray-500 text-sm mb-6">Set email, personal details and role.</div>
        {rolesLoading ? (
          <div className="text-center text-gray-400 py-8">Loading roles…</div>
        ) : rolesError ? (
          <div className="text-center text-red-500 py-8">Failed to load roles</div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} className="mt-1" aria-invalid={!!errors.firstName} />
                {errors.firstName && <div className="text-xs text-red-500 mt-1">{errors.firstName}</div>}
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} className="mt-1" aria-invalid={!!errors.lastName} />
                {errors.lastName && <div className="text-xs text-red-500 mt-1">{errors.lastName}</div>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="mt-1" aria-invalid={!!errors.email} />
                {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} className="mt-1" aria-invalid={!!errors.phone} />
                {errors.phone && <div className="text-xs text-red-500 mt-1">{errors.phone}</div>}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Role</div>
              <RadioGroup value={form.role?.toString()} onValueChange={handleRoleChange} name="role" className="space-y-2">
                {roles?.map((role: { id: number; name: string; description: string }) => (
                  <div className="flex items-center space-x-2" key={role.id}>
                    <RadioGroupItem value={role.id.toString()} id={`role-${role.id}`} />
                    <Label htmlFor={`role-${role.id}`} className="flex-1">
                      <span className="font-normal">{role.name}</span>{" "}
                      <span className="text-gray-400">- {role.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.role && <div className="text-xs text-red-500 mt-1">{errors.role}</div>}
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600 text-white rounded-md px-6" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
} 