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
    """
    def has_object_permission(self, request, view, obj):
        required_permission = getattr(view, 'required_permission', None)
        if not required_permission:
            return True
        return user_has_team_permission(request.user, obj, required_permission) 
