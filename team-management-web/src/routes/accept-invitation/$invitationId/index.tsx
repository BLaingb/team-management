import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    useLoaderData,
    useParams
} from "@tanstack/react-router";
import { SignupForm } from "../../../components/auth/SignupForm";
import { InvitationDetailsCard } from "../../../components/invitations/InvitationDetailsCard";
import { useAcceptRejectInvitation } from "../../../hooks/useAcceptRejectInvitation";

export const Route = createFileRoute("/accept-invitation/$invitationId/")({
	loader: async ({ params }) => {
		const invitation = await import("@/lib/team-client").then(m => m.teamClient.getTeamInvitation(Number(params.invitationId)));
		return { invitation };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { invitation } = useLoaderData({ from: "/accept-invitation/$invitationId/" });
	const { invitationId } = useParams({ from: "/accept-invitation/$invitationId/" });
	const { data: session, isLoading: sessionLoading } = useQuery({
		queryKey: ["session"],
		queryFn: authClient.getSession,
	});
	const isAuthenticated = !!session;
	const { accept, reject, acceptPending, rejectPending } = useAcceptRejectInvitation(Number(invitationId), invitation.team.id);

	if (sessionLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">Loading...</div>
		);
	}
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
				{isAuthenticated ? (
					<div className="flex gap-2 w-full">
						<Button
							className="flex-1 bg-blue-600"
							onClick={accept}
							disabled={acceptPending}
						>
							Accept
						</Button>
						<Button
							className="flex-1 bg-red-600"
							variant="destructive"
							onClick={reject}
							disabled={rejectPending}
						>
							Reject
						</Button>
					</div>
				) : invitation.user_exists ? (
					<Button
						className="w-full bg-blue-600"
						onClick={() =>
							window.location.assign(
								`/auth/login?redirect=/accept-invitation/${invitationId}`
							)
						}
					>
						Login to accept or reject invitation
					</Button>
				) : (
					<SignupForm invitation={invitation} onSuccess={() => window.location.reload()} />
				)}
			</InvitationDetailsCard>
		</div>
	);
}
