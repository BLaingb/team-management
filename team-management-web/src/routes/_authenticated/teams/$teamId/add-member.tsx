import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppForm } from "@/hooks/useAppForm";
import { teamClient, useGetTeamPermissions } from "@/lib/team-client";
import { hasTeamPermission } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().min(1, "Role is required"),
});

export const Route = createFileRoute("/_authenticated/teams/$teamId/add-member")({
  component: AddMemberPage,
});

function AddMemberPage() {
  const navigate = useNavigate();
  const { teamId } = useParams({ from: "/_authenticated/teams/$teamId/add-member" });
  const teamIdNum = Number(teamId);

  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ["team-roles"],
    queryFn: teamClient.getTeamRoles,
  });
  const { data: teamPermissions } = useGetTeamPermissions(teamIdNum);
  if (!hasTeamPermission("members:add", teamPermissions?.permissions)) {
    navigate({ to: "/teams/$teamId", params: { teamId: teamIdNum.toString() } });
  }

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "1",
    },
    validators: {
      onBlur: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await teamClient.addTeamMember({
          team: teamIdNum,
          email: value.email,
          first_name: value.firstName,
          last_name: value.lastName,
          phone_number: value.phone,
          role: Number(value.role),
        });
        toast.success("Team member invited!");
        navigate({ to: "/teams/$teamId", params: { teamId: teamIdNum.toString() } });
      } catch (err) {
        toast.error((err as Error).message || "Failed to add team member");
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-200">
        <div className="text-xl font-semibold mb-1">Add a team member</div>
        <div className="text-gray-500 text-sm mb-6">Set email, personal details and role.</div>
        {rolesLoading ? (
          <div className="text-center text-gray-400 py-8">Loading roles…</div>
        ) : rolesError ? (
          <div className="text-center text-red-500 py-8">Failed to load roles</div>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
            noValidate
          >
            <form.AppField name="firstName">
              {(field) => <field.TextField label="First name" placeholder="Enter first name" />}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => <field.TextField label="Last name" placeholder="Enter last name" />}
            </form.AppField>
            <form.AppField name="email">
              {(field) => <field.TextField label="Email" placeholder="Enter email" />}
            </form.AppField>
            <form.AppField name="phone">
              {(field) => <field.PhoneField label="Phone" />}
            </form.AppField>
            <form.AppField name="role">
            {(field) => (
                <div>
                  <Label className="mb-2 block">Role</Label>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    className="space-y-2"
                  >
                    {roles?.map((role: { id: number; name: string; description: string }) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={role.id.toString()} id={`role-${role.id}`} />
                        <Label htmlFor={`role-${role.id}`} className="font-medium">
                          {role.name} <span className="text-xs text-gray-500">- {role.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {field.state.meta.errors && field.state.meta.errors.length > 0 &&
                    typeof field.state.meta.errors[0] === "string" && (
                      <div className="text-xs text-red-500 mt-1">{field.state.meta.errors[0]}</div>
                    )}
                </div>
              )}
            </form.AppField>
            {form.state.errors && form.state.errors.length > 0 &&
                    typeof form.state.errors[0] === "string" && (
                      <div className="text-xs text-red-500 mt-1">{form.state.errors[0]}</div>
                    )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md text-sm"
              disabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 