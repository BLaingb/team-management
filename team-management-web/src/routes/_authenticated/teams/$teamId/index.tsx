import { TeamInvitationsCard } from '@/components/teams/TeamInvitationsCard';
import { TeamMembersCard } from '@/components/teams/TeamMembersCard';
import { teamClient } from '@/lib/team-client';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/teams/$teamId/')({
  loader: async ({ params }) => {
    const team = await teamClient.getTeam(Number(params.teamId));
    const invitations = await teamClient.getActiveInvitations(Number(params.teamId));
    return { team, invitations };
  },
  component: RouteComponent,
})



function RouteComponent() {
  const { team, invitations } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-lg font-semibold">{team.name}</div>
        <div className="text-gray-500 text-sm">{team.description}</div>
        <TeamMembersCard team={team} />
        <TeamInvitationsCard invitations={invitations} />
      </div>
    </div>
  );
}
