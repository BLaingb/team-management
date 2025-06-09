import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAppForm } from "@/hooks/useAppForm";
import { teamClient, useGetTeamPermissions } from "@/lib/team-client";
import { hasTeamPermission } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  role: z.string().min(1, "Role is required"),
});

export const Route = createFileRoute("/_authenticated/teams/$teamId/edit-member/$memberId/")({
  component: EditMemberPage,
});

function EditMemberPage() {
  const navigate = useNavigate();
  const { teamId, memberId } = useParams({ from: "/_authenticated/teams/$teamId/edit-member/$memberId/" });
  const teamIdNum = Number(teamId);
  const memberIdNum = Number(memberId);

  const {
    data: member,
    isLoading: memberLoading,
    error: memberError,
  } = useQuery({
    queryKey: ["team-member", teamIdNum, memberIdNum],
    queryFn: () => teamClient.getTeamMember(teamIdNum, memberIdNum),
  });

  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ["team-roles"],
    queryFn: teamClient.getTeamRoles,
  });
  const { data: teamPermissions } = useGetTeamPermissions(teamIdNum);
  if (!hasTeamPermission("members:update", teamPermissions?.permissions)) {
    navigate({ to: "/teams/$teamId", params: { teamId: teamIdNum.toString() } });
  }

  const form = useAppForm({
    defaultValues: { role: member?.role?.id.toString() || "" },
    validators: { onBlur: formSchema },
    onSubmit: async ({ value }) => {
      try {
        await teamClient.updateTeamMemberRole(teamIdNum, memberIdNum, Number(value.role));
        toast.success("Team member role updated!");
        navigate({ to: "/teams/$teamId", params: { teamId: teamIdNum.toString() } });
      } catch (err) {
        toast.error((err as Error).message || "Failed to update team member");
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-200">
        <div className="text-xl font-semibold mb-1">Edit team member</div>
        <div className="text-gray-500 text-sm mb-6">Edit role for this team member.</div>
        {memberLoading || rolesLoading ? (
          <div className="text-center text-gray-400 py-8">Loading…</div>
        ) : memberError || rolesError ? (
          <div className="text-center text-red-500 py-8">Failed to load data</div>
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
            <div>
              <Label className="mb-1 block">First name</Label>
              <Input value={member?.user?.full_name?.split?.(" ")[0] || ""} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label className="mb-1 block">Last name</Label>
              <Input value={member?.user?.full_name?.split?.(" ")?.slice?.(1)?.join(" ") || ""} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label className="mb-1 block">Email</Label>
              <Input value={member?.user?.email || ""} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label className="mb-1 block">Phone</Label>
              <Input value={member?.user?.phone_number || ""} readOnly className="bg-gray-50" />
            </div>
            <Separator />
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
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" className="bg-blue-600 text-white rounded-md px-6">
                {form.state.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

export default EditMemberPage; 