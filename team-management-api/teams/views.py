from rest_framework import viewsets, generics
from .models import Team, TeamInvitation, TeamRole, TeamMember
from .serializers import (
    TeamSerializer,
    TeamInvitationSerializer,
    TeamRoleSerializer,
    TeamInvitationDetailSerializer,
    TeamMemberSerializer,
    TeamMemberUpdateSerializer,
)
from utils.emailsender import email_sender
from datetime import timedelta
from django.utils import timezone
from django.template.loader import render_to_string
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .permissions import HasTeamPermission
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated


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

    def perform_create(self, serializer):
        team = serializer.save()
        admin_role = TeamRole.objects.get(name="Admin")
        TeamMember.objects.create(team=team, user=self.request.user, role=admin_role)


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
            return Response(
                {"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND
            )
        self.check_object_permissions(request, team)
        invitations = TeamInvitation.objects.active_invitations_for_team(team)
        serializer = TeamInvitationSerializer(invitations, many=True)
        return Response(serializer.data)


class TeamInvitationDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, invitation_id):
        invitation = get_object_or_404(TeamInvitation, id=invitation_id)
        serializer = TeamInvitationDetailSerializer(invitation)
        return Response(serializer.data)


class MyActiveInvitationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_email = request.user.email
        now = timezone.now()
        invitations = TeamInvitation.objects.filter(
            email=user_email, status="pending", expires_at__gt=now
        )
        serializer = TeamInvitationSerializer(invitations, many=True)
        return Response(serializer.data)


class AcceptInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, invitation_id):
        invitation = get_object_or_404(TeamInvitation, id=invitation_id)
        if invitation.status != "pending":
            return Response(
                {"detail": "Invitation is not pending."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if invitation.expires_at <= timezone.now():
            return Response(
                {"detail": "Invitation has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if request.user.email.lower() != invitation.email.lower():
            return Response(
                {"detail": "You are not authorized to accept this invitation."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if not TeamMember.objects.is_user_member(invitation.team, request.user.email):
            TeamMember.objects.create(
                team=invitation.team, user=request.user, role=invitation.role
            )
        invitation.status = "accepted"
        invitation.save()
        return Response(
            {"detail": "Invitation accepted and you have been added to the team."},
            status=status.HTTP_200_OK,
        )


class RejectInvitationView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, invitation_id):
        invitation = get_object_or_404(TeamInvitation, id=invitation_id)
        if invitation.status != "pending":
            return Response(
                {"detail": "Invitation is not pending."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if invitation.expires_at <= timezone.now():
            return Response(
                {"detail": "Invitation has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        invitation.status = "rejected"
        invitation.save()
        return Response({"detail": "Invitation rejected."}, status=status.HTTP_200_OK)


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    permission_classes = [HasTeamPermission]
    required_permission = "members:view"

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return TeamMemberUpdateSerializer
        return TeamMemberSerializer

    def get_permissions(self):
        if self.action in ["update", "partial_update"]:
            self.required_permission = "members:update"
        elif self.action == "destroy":
            self.required_permission = "members:remove"
        else:
            self.required_permission = "members:view"
        return super().get_permissions()

    def get_queryset(self):
        team_id = self.kwargs.get("team_pk")
        if team_id:
            return TeamMember.objects.filter(team_id=team_id)
        return TeamMember.objects.none()

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj.team)
        return obj

    def create(self, request, *args, **kwargs):
        return Response(
            {
                "detail": "Creation of team members is not allowed. Invite a team member instead."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


class MyTeamPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, team_id):
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            team_member = TeamMember.objects.get(team=team, user=request.user)
        except TeamMember.DoesNotExist:
            return Response({"detail": "You are not a member of this team."}, status=status.HTTP_403_FORBIDDEN)
        role = team_member.role
        return Response({
            "team": team.id,
            "role": role.name,
            "permissions": role.permissions,
        })
