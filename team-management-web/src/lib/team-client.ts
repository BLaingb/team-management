import { env } from "@/env";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const TEAMS_QUERY_KEY = ["teams"];

const teamMemberSchema = z.object({
	user: z.object({
		id: z.number(),
		full_name: z.string(),
		email: z.string(),
		phone_number: z.string(),
	}),
	role: z.object({
		id: z.number(),
		name: z.string(),
		description: z.string(),
	}),
});

const teamSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	members: z.array(teamMemberSchema),
});

export type Team = z.infer<typeof teamSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;

export const teamClient = {
	getTeams: async () => {
		try {
			const response = await fetch(`${env.VITE_API_URL}/api/teams/`, {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Failed to fetch teams");
			}
			const data = await response.json();
			return teamSchema.array().parse(data);
		} catch (error) {
			console.error("Error fetching teams:", error);
			throw error;
		}
	},
    getTeam: async (teamId: number) => {
        try {
            const response = await fetch(`${env.VITE_API_URL}/api/teams/${teamId}/`, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch team");
            }
            const data = await response.json();
            return teamSchema.parse(data);
        } catch (error) {
            console.error("Error fetching team:", error);
            throw error;
        }
    }
};

export const useGetTeams = () => {
    return useQuery({
        queryKey: TEAMS_QUERY_KEY,
        queryFn: teamClient.getTeams,
    });
};

export const useGetTeam = (teamId: number) => {
    return useQuery({
        queryKey: ["team", teamId],
        queryFn: () => teamClient.getTeam(teamId),
    });
};