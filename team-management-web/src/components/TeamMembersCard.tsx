import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";

export interface TeamMember {
	user: {
		id: number;
		full_name: string;
		email: string;
		phone_number: string;
	};
	role: {
		id: number;
		name: string;
		description: string;
	};
}

export interface Team {
	id: number;
	name: string;
	description: string;
	members: TeamMember[];
}

export function TeamMembersCard({ team }: { team: Team }) {
	return (
		<Card className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-md mx-auto">
			<div className="flex flex-row justify-between items-center">
				<div className="text-lg font-semibold">Team members</div>
				<Button asChild variant="outline" size="sm">
					<Link to="/teams/add-member" search={{ teamId: team.id.toString() }}>
						<PlusIcon className="w-4 h-4" />
						Add member
					</Link>
				</Button>
			</div>
			<div className="text-gray-500 text-sm">
				{/* Consider if we want to decrease by 1, as to not to account the current user */}
				You have {team.members.length} team member
				{team.members.length !== 1 && "s"}.
			</div>
			<div className="space-y-4">
				{team.members.map((member, idx) => (
                    // TODO: Update link to team member page
					<Link
						key={member.user.id}
						to="/teams/$teamId"
						params={{ teamId: team.id.toString() }}
						className="hover:text-gray-600 hover:cursor-pointer"
					>
						<div>
							<div className="flex items-center space-x-4">
								<Avatar className="h-10 w-10">
									<AvatarFallback>
										{getInitials(member.user.full_name)}
									</AvatarFallback>
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
								<ChevronRight className="text-gray-400 w-8 h-8" />
							</div>
							{idx < team.members.length - 1 && <Separator className="my-4" />}
						</div>
					</Link>
				))}
			</div>
		</Card>
	);
}
