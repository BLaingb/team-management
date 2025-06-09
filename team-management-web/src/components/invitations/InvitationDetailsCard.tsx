import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { TeamInvitationDetail } from "@/lib/team-client";
import type { ReactNode } from "react";

interface InvitationDetailsCardProps {
  invitation: TeamInvitationDetail;
  children?: ReactNode;
}

export function InvitationDetailsCard({ invitation, children }: InvitationDetailsCardProps) {
  return (
    <Card className="w-full max-w-md border border-gray-200 rounded-lg bg-white">
      <CardHeader>
        <CardTitle>Team Invitation</CardTitle>
        <CardDescription>
          You have been invited to join <b>{invitation.team.name}</b> as {" "}
          <b>{invitation.first_name} {invitation.last_name}</b> ({invitation.email})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Status:</Label> <span className="text-sm">{invitation.status}</span>
        </div>
        <div>
          <Label>Expires at:</Label> <span className="text-sm">{new Date(invitation.expires_at).toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {children}
      </CardFooter>
    </Card>
  );
} 