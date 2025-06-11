from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from utils.validators.phone_number_validator import PhoneNumberValidator

UserModel = get_user_model()


class Team(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class TeamRole(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    permissions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    def can_manage_members(self):
        permissions = ["members:add", "members:update", "members:remove"]
        return all(permission in self.permissions for permission in permissions)


class TeamMemberManager(models.Manager):
    def is_user_member(self, team, email):
        return self.filter(team=team, user__email=email).exists()

    def is_last_admin(self, team_member):
        if not team_member.role.can_manage_members():
            return False
        admin_count = self.filter(
            team=team_member.team,
            role=team_member.role
        ).count()
        return admin_count <= 1


class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    role = models.ForeignKey(TeamRole, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TeamMemberManager()

    def __str__(self):
        return f"{self.user.email} - {self.team.name}"


class TeamInvitationManager(models.Manager):
    def has_pending_or_accepted_invitation(self, team, email):
        return self.filter(
            team=team, email=email, status__in=["pending", "accepted"]
        ).exists()

    def active_invitations_for_team(self, team):
        return self.filter(team=team, status="pending", expires_at__gt=timezone.now())


class TeamInvitation(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    email = models.EmailField()
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=255, validators=[PhoneNumberValidator()])
    role = models.ForeignKey(TeamRole, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=255,
        choices=[
            ("pending", "Pending"),
            ("accepted", "Accepted"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)

    objects = TeamInvitationManager()

    def __str__(self):
        return f"{self.email} - {self.team.name}"

    def get_accept_url(self):
        return f"{settings.FRONTEND_URL}/accept-invitation/{self.id}"

    def get_reject_url(self):
        return f"{settings.FRONTEND_URL}/reject-invitation/{self.id}"
