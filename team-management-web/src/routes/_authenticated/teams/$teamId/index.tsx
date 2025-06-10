import { TeamInvitationsCard } from '@/components/teams/TeamInvitationsCard';
import { TeamMembersCard } from '@/components/teams/TeamMembersCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGetSession } from '@/lib/auth-client';
import { teamClient } from '@/lib/team-client';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

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
  const { teamId } = useParams({ from: '/_authenticated/teams/$teamId/' });
  const navigate = useNavigate();
  const { data: user } = useGetSession();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const handleLeaveTeam = async () => {
    try {
      const currentUserMember = team.members.find(member => member.user.id === user?.id);
      if (!currentUserMember) {
        throw new Error("You are not a member of this team");
      }
      await teamClient.deleteTeamMember(Number(teamId), currentUserMember.id);
      toast.success("You have left the team");
      navigate({ to: "/teams" });
    } catch (err) {
      toast.error((err as Error).message || "Failed to leave team");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-semibold">{team.name}</div>
            <div className="text-gray-500 text-sm">{team.description}</div>
          </div>
          {team.members.some(member => member.user.id === user?.id) && (
            <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" type="button">
                  Leave Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. You will be removed from the team and will need to be invited back to rejoin.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleLeaveTeam}>
                    Leave Team
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <TeamMembersCard team={team} />
        <TeamInvitationsCard invitations={invitations} />
      </div>
    </div>
  );
}
