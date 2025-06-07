import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { teamClient } from "@/lib/team-client";
import { getInitials } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/teams/")({
	loader: async () => {
		const teams = await teamClient.getTeams();
		return { teams };
	},
	component: RouteComponent,
});

function EmptyState() {
	return (
		<div className="min-h-screen bg-gray-50 py-10 flex items-center justify-center">
			<div className="max-w-xl mx-auto space-y-6">
				<div className="text-center text-gray-500">
					<div className="text-2xl font-bold">No teams found</div>
					<div className="text-gray-500 flex flex-col items-center justify-center">
						You don't have any teams yet. Create a new team to get started.
						{/* TODO: Add a link to the create team page */}
						<Button variant="outline" className="mt-4">
							Create Team
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

function RouteComponent() {
	const { teams } = Route.useLoaderData();
	if (!teams || teams.length === 0) {
		return <EmptyState />;
	}
	const membersByTeam = teams.reduce(
		(
			acc: Record<
				number,
				{
					members: {
						user: {
							id: number;
							full_name: string;
							email: string;
							phone_number: string;
						};
						role: { id: number; name: string; description: string };
					}[];
					extraCount: number;
				}
			>,
			team,
		) => {
			const members = team.members.slice(0, 3);
			const extraCount = team.members.length - 3;
			acc[team.id] = {
				members,
				extraCount,
			};
			return acc;
		},
		{} as Record<
			number,
			{
				members: {
					user: {
						id: number;
						full_name: string;
						email: string;
						phone_number: string;
					};
					role: { id: number; name: string; description: string };
				}[];
				extraCount: number;
			}
		>,
	);

	return (
		<div className="min-h-screen bg-gray-50 py-10">
			<div className="max-w-xl mx-auto space-y-6">
				{teams.map((team) => {
					const { members, extraCount } = membersByTeam[team.id];
					return (
						<Card key={team.id} className="border border-gray-200 rounded-lg bg-white">
							<Link
								to="/teams/$teamId"
								params={{ teamId: team.id.toString() }}
								className="mb-4"
							>
								<CardHeader>
									<CardTitle>{team.name}</CardTitle>
									<div className="text-gray-500 text-sm mt-1">
										{team.description}
									</div>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-2 justify-between">
										<div className="flex items-center">
											{members.map((member, idx) => (
												<div
													key={member.user.id}
													className={`w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm border-2 border-white ${idx !== 0 ? "-ml-2" : ""}`}
													title={member.user.full_name}
												>
													{getInitials(member.user.full_name)}
												</div>
											))}
											{extraCount > 0 && (
												<div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-sm border-2 border-white -ml-2">
													+{extraCount}
												</div>
											)}
										</div>
										<ChevronRight className="text-gray-400 w-8 h-8 mt-[-12%]" />
									</div>
								</CardContent>
							</Link>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
