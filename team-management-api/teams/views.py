from rest_framework import viewsets, generics
from .models import Team, TeamInvitation, TeamRole
from .serializers import TeamSerializer, TeamInvitationSerializer, TeamRoleSerializer
from utils.emailsender import email_sender
from datetime import timedelta
from django.utils import timezone
from django.template.loader import render_to_string


class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer

    def get_queryset(self):
        user = self.request.user
        return Team.objects.filter(teammember__user=user)


class TeamRoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamRole.objects.all()
    serializer_class = TeamRoleSerializer


class TeamInvitationCreateView(generics.CreateAPIView):
    queryset = TeamInvitation.objects.all()
    serializer_class = TeamInvitationSerializer

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
