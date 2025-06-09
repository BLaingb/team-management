from rest_framework.permissions import BasePermission
from .models import TeamMember


def user_has_team_permission(user, team, permission):
    try:
        team_member = TeamMember.objects.get(team=team, user=user)
    except TeamMember.DoesNotExist:
        return False
    return permission in (team_member.role.permissions or [])


class HasTeamPermission(BasePermission):
    """
    Checks if the user has the required permission for the team based on the team member's role.
    Works with Team objects and objects with a team attribute.
    """

    def get_team(self, obj):
        # Handle Team objects
        if hasattr(obj, "pk") and obj.__class__.__name__ == "Team":
            return obj
        # Handle Objects with a team attribute
        if hasattr(obj, "team"):
            return obj.team
        return None

    def has_object_permission(self, request, view, obj):
        required_permission = getattr(view, "required_permission", None)
        if not required_permission:
            return True
        team = self.get_team(obj)
        if team is None:
            return False
        return user_has_team_permission(request.user, team, required_permission)
