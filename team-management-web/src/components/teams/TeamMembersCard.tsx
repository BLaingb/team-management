import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type Team, useGetTeamPermissions } from "@/lib/team-client";
import { hasTeamPermission } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import { TeamMembersItem } from "./TeamMembersItem";



export function TeamMembersCard({ team }: { team: Team }) {
    const { data: teamPermissions } = useGetTeamPermissions(team.id);
    if (!hasTeamPermission("members:view", teamPermissions?.permissions)) {
        return null;
    }
	return (
		<Card className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-md mx-auto">
			<div className="flex flex-row justify-between items-center">
				<div className="text-lg font-semibold">Team members</div>
                {hasTeamPermission("members:add", teamPermissions?.permissions) && (
				<Button asChild variant="outline" size="sm">
					<Link to="/teams/$teamId/add-member" params={{ teamId: team.id.toString() }}>
						<PlusIcon className="w-4 h-4" />
							Add member
						</Link>
					</Button>
				)}
			</div>
			<div className="text-gray-500 text-sm">
				{/* Consider if we want to decrease by 1, as to not to account the current user */}
				You have {team.members.length} team member
				{team.members.length !== 1 && "s"}.
			</div>
			<div className="space-y-4">
				{team.members.map((member, idx) => (
                    <>
                        <TeamMembersItem key={member.user.id} teamId={team.id} member={member} />
                        {idx < team.members.length - 1 && <Separator className="my-4" />}
                    </>
				))}
			</div>
		</Card>
	);
}
