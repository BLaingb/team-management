import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { TeamInvitation } from '@/lib/team-client';

export function TeamInvitationsCard({ invitations }: { invitations: TeamInvitation[] }) {
    return (
      <Card className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-md mx-auto mt-6">
        <div className="text-lg font-semibold mb-2">Pending Invitations</div>
        {invitations && invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((invite, idx) => (
              <div key={invite.id}>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{invite.first_name} {invite.last_name} <span className="text-xs text-gray-500">({invite.email})</span></div>
                    <div className="text-xs text-gray-500 leading-tight">Status: {invite.status}</div>
                    <div className="text-xs text-gray-400 leading-tight">Sent: {new Date(invite.created_at).toLocaleString()}</div>
                    <div className="text-xs text-gray-400 leading-tight">Expires: {new Date(invite.expires_at).toLocaleString()}</div>
                  </div>
                </div>
                {idx < invitations.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">No pending invitations</div>
        )}
      </Card>
    );
  }