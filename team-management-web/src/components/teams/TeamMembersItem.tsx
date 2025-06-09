import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    type TeamMember,
    useGetTeamPermissions
} from "@/lib/team-client";
import { getInitials, hasTeamPermission } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

function TeamMemberItemComponent({ member, children }: { member: TeamMember, children?: React.ReactNode }) {
	return (
		<div>
			<div className="flex items-center space-x-4">
				<Avatar className="h-10 w-10">
					<AvatarFallback>{getInitials(member.user.full_name)}</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<div className="font-medium text-gray-900 text-sm">
						{member.user.full_name}
						{member.role.name.toLowerCase() === "admin" && (
							<span className="ml-1 text-xs font-semibold text-gray-500">
								(admin)
							</span>
						)}
					</div>
					<div className="text-xs text-gray-500 leading-tight">
						{member.user.phone_number}
					</div>
					<div className="text-xs text-gray-500 leading-tight">
						{member.user.email}
					</div>
				</div>
				{children}
			</div>
		</div>
	);
}

export function TeamMembersItem({
	teamId,
	member,
}: { teamId: number; member: TeamMember }) {
	const { data: teamPermissions } = useGetTeamPermissions(teamId);
	if (!hasTeamPermission("members:view", teamPermissions?.permissions)) {
		return null;
	}
	if (!hasTeamPermission("members:update", teamPermissions?.permissions)) {
		return <TeamMemberItemComponent member={member} />;
	}
	return (
		<Link
			to="/teams/$teamId/edit-member/$memberId"
			params={{ teamId: teamId.toString(), memberId: member.id.toString() }}
			className="hover:text-gray-600 hover:cursor-pointer"
		>
            <TeamMemberItemComponent member={member}>
                <ChevronRight className="text-gray-400 w-8 h-8" />
            </TeamMemberItemComponent>
		</Link>
	);
}
