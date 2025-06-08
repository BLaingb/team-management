from rest_framework import viewsets, generics
from .models import Team, TeamInvitation, TeamRole
from .serializers import TeamSerializer, TeamInvitationSerializer, TeamRoleSerializer
from utils.emailsender import email_sender
from datetime import timedelta
from django.utils import timezone
from django.template.loader import render_to_string
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from .permissions import user_has_team_permission, HasTeamPermission


class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [HasTeamPermission]
    required_permission = "team:view"

    def get_queryset(self):
        user = self.request.user
        return Team.objects.filter(teammember__user=user)

    def get_permissions(self):
        if self.action in ["update", "partial_update"]:
            self.required_permission = "team:update"
        elif self.action == "destroy":
            self.required_permission = "team:delete"
        else:
            self.required_permission = "team:view"
        return super().get_permissions()


class TeamRoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamRole.objects.all()
    serializer_class = TeamRoleSerializer


class TeamInvitationCreateView(generics.CreateAPIView):
    queryset = TeamInvitation.objects.all()
    serializer_class = TeamInvitationSerializer
    permission_classes = [HasTeamPermission]
    required_permission = "members:add"

    def perform_create(self, serializer):
        expires_at = timezone.now() + timedelta(days=15)
        invitation = serializer.save(expires_at=expires_at)
        current_user = self.request.user
        context = {
            "inviter_name": current_user.get_full_name(),
            "team_name": invitation.team.name,
            "accept_url": invitation.get_accept_url(),
            "reject_url": invitation.get_reject_url(),
            "expiry_days": 15,  # TODO: Make this dynamic
        }
        html_body = render_to_string("teams/invitation_email.html", context)
        plain_body = render_to_string("teams/invitation_email.txt", context)
        email_sender.send_email(
            invitation.email,
            "You have been invited to a team",
            html_body,
            plain_body=plain_body,
        )


class TeamActiveInvitationsView(APIView):
    permission_classes = [HasTeamPermission]
    required_permission = "team:view"

    def get(self, request, team_id):
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, team)
        invitations = TeamInvitation.objects.active_invitations_for_team(team)
        serializer = TeamInvitationSerializer(invitations, many=True)
        return Response(serializer.data)
