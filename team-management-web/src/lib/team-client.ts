import { env } from "@/env";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const TEAMS_QUERY_KEY = ["teams"];

const teamRoleSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
});

const teamMemberSchema = z.object({
    id: z.number(),
	user: z.object({
		id: z.number(),
		full_name: z.string(),
		email: z.string(),
		phone_number: z.string(),
	}),
	role: teamRoleSchema,
});

const teamSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	members: z.array(teamMemberSchema),
});

const teamMemberInvitationSchema = z.object({
	team: z.number(),
	email: z.string(),
	first_name: z.string(),
	last_name: z.string(),
	phone_number: z.string(),
	role: z.number(),
});

const teamInvitationSchema = z.object({
	id: z.number(),
	team: z.number(),
	email: z.string(),
	first_name: z.string(),
	last_name: z.string(),
	phone_number: z.string(),
	role: z.number(),
	status: z.string(),
	created_at: z.string(),
	expires_at: z.string(),
	updated_at: z.string(),
});

const teamInvitationDetailSchema = teamInvitationSchema.extend({
	team: z.object({
        id: z.number(),
        name: z.string(),
        description: z.string(),
    }),
    user_exists: z.boolean(),
});

export type Team = z.infer<typeof teamSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type TeamMemberInvitation = z.infer<typeof teamMemberInvitationSchema>;
export type TeamInvitation = z.infer<typeof teamInvitationSchema>;
export type TeamInvitationDetail = z.infer<typeof teamInvitationDetailSchema>;

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
	},
	addTeamMember: async (invitation: TeamMemberInvitation) => {
		try {
			const response = await fetch(
				`${env.VITE_API_URL}/api/team-invitations/`,
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(invitation),
				},
			);
			if (!response.ok) {
				const errorResponse = await response.json();
                // TODO: Add generic error handling based on DRF error response format
				if (errorResponse.non_field_errors) {
					throw new Error(errorResponse.non_field_errors[0]);
				}
				throw new Error("Failed to add team member");
			}
			return response.json();
		} catch (error) {
			console.error("Error adding team member:", error);
			throw error;
		}
	},
    getTeamRoles: async () => {
        try {
            const response = await fetch(`${env.VITE_API_URL}/api/team-roles/`, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch team roles");
            }
            const data = await response.json();
            return teamRoleSchema.array().parse(data);
        } catch (error) {
            console.error("Error fetching team roles:", error);
            throw error;
        }
    },
	getActiveInvitations: async (teamId: number) => {
		try {
			const response = await fetch(`${env.VITE_API_URL}/api/teams/${teamId}/active-invitations/`, {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Failed to fetch active invitations");
			}
			const data = await response.json();
			return teamInvitationSchema.array().parse(data);
		} catch (error) {
			console.error("Error fetching active invitations:", error);
			throw error;
		}
	},
    getTeamInvitation: async (invitationId: number) => {
        try {
            const response = await fetch(`${env.VITE_API_URL}/api/team-invitations/${invitationId}`, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch team invitation");
            }
            const data = await response.json();
            return teamInvitationDetailSchema.parse(data);
        } catch (error) {
            console.error("Error fetching team invitation:", error);
            throw error;
        }
    },
    acceptTeamInvitation: async (invitationId: number) => {
        try {
            const response = await fetch(`${env.VITE_API_URL}/api/team-invitations/${invitationId}/accept/`, {
                credentials: "include",
                method: "POST",
            });
            if (!response.ok) {
                throw new Error("Failed to accept team invitation");
            }
            return response.json();
        } catch (error) {
            console.error("Error accepting team invitation:", error);
            throw error;
        }
    },
    rejectTeamInvitation: async (invitationId: number) => {
        try {
            const response = await fetch(`${env.VITE_API_URL}/api/team-invitations/${invitationId}/reject/`, {
                credentials: "include",
                method: "POST",
            });
            if (!response.ok) {
                throw new Error("Failed to reject team invitation");
            }
            return response.json();
        } catch (error) {
            console.error("Error rejecting team invitation:", error);
            throw error;
        }
    },
    getTeamMember: async (teamId: number, memberId: number) => {
        try {
            const response = await fetch(`${env.VITE_API_URL}/api/teams/${teamId}/members/${memberId}/`, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch team member");
            }
            const data = await response.json();
            return teamMemberSchema.parse(data);
        } catch (error) {
            console.error("Error fetching team member:", error);
            throw error;
        }
    },
    updateTeamMemberRole: async (teamId: number, memberId: number, roleId: number) => {
        try {
            const response = await fetch(`${env.VITE_API_URL}/api/teams/${teamId}/members/${memberId}/`, {
                credentials: "include",
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: roleId }),
            });
            if (!response.ok) {
                throw new Error("Failed to update team member");
            }
            return response.json();
        } catch (error) {
            console.error("Error updating team member:", error);    
            throw error;
        }
    },
    deleteTeamMember: async (teamId: number, memberId: number) => {
        try {
            const response = await fetch(`${env.VITE_API_URL}/api/teams/${teamId}/members/${memberId}/`, {
                credentials: "include",
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete team member");
            }
            return response.json();
        } catch (error) {
            console.error("Error deleting team member:", error);
            throw error;
        }
    },
                credentials: "include",
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
