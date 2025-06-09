import { teamClient } from "@/lib/team-client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function useAcceptRejectInvitation(invitationId: number, teamId: number) {
  const navigate = useNavigate();

  const acceptMutation = useMutation({
    mutationFn: () => teamClient.acceptTeamInvitation(invitationId),
    onSuccess: () => {
      toast.success("Invitation accepted!");
      navigate({ to: `/teams/${teamId}` });
    },
    onError: (err: unknown) => {
      const error = err as Error;
      toast.error(error.message || "Failed to accept invitation");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => teamClient.rejectTeamInvitation(invitationId),
    onSuccess: () => {
      toast.success("Invitation rejected.");
    },
    onError: (err: unknown) => {
      const error = err as Error;
      toast.error(error.message || "Failed to reject invitation");
    },
  });

  return {
    accept: () => acceptMutation.mutate(),
    reject: () => rejectMutation.mutate(),
    acceptPending: acceptMutation.isPending,
    rejectPending: rejectMutation.isPending,
  };
} 