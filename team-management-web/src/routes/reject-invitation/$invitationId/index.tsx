import { Button } from "@/components/ui/button";
import { teamClient } from "@/lib/team-client";
import {
  Link,
  createFileRoute,
  useLoaderData,
  useParams,
} from "@tanstack/react-router";
import { InvitationDetailsCard } from "../../../components/invitations/InvitationDetailsCard";
import { useAcceptRejectInvitation } from "../../../hooks/useAcceptRejectInvitation";

export const Route = createFileRoute("/reject-invitation/$invitationId/")({
  loader: async ({ params }) => {
    const invitation = await teamClient.getTeamInvitation(Number(params.invitationId));
    return { invitation };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { invitation } = useLoaderData({ from: "/reject-invitation/$invitationId/" });
  const { invitationId } = useParams({ from: "/reject-invitation/$invitationId/" });
  const { reject, rejectPending } = useAcceptRejectInvitation(
    Number(invitationId),
    invitation.team.id
  );

  if (!invitation) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Invitation not found.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <InvitationDetailsCard invitation={invitation}>
        <Button
        className="w-full bg-red-600"
        variant="destructive"
        onClick={reject}
        disabled={rejectPending || invitation.status !== "pending"}
        >
        Reject Invitation
        </Button>
        <div className="text-center mt-2">
          <span className="text-sm text-gray-500 mr-2">Changed your mind?</span>
          <Link
            to="/accept-invitation/$invitationId"
            params={{ invitationId }}
            className="text-blue-600 hover:underline"
          >
            Accept the invitation
          </Link>
        </div>
      </InvitationDetailsCard>
    </div>
  );
}
