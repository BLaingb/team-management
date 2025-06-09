from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from .views import (
    TeamViewSet,
    TeamInvitationCreateView,
    TeamRoleViewSet,
    TeamActiveInvitationsView,
    TeamInvitationDetailView,
    MyActiveInvitationsView,
    AcceptInvitationView,
    RejectInvitationView,
    TeamMemberViewSet,
    MyTeamPermissionsView,
)

router = DefaultRouter()
router.register(r"teams", TeamViewSet, basename="team")
router.register(r"team-roles", TeamRoleViewSet, basename="team-role")

teams_router = NestedDefaultRouter(router, r"teams", lookup="team")
teams_router.register(r"members", TeamMemberViewSet, basename="team-members")


urlpatterns = (
    router.urls
    + teams_router.urls
    + [ # Specific paths that don't follow ViewSet patterns
        # Team Invitations
        path(
            "team-invitations/",
            TeamInvitationCreateView.as_view(),
            name="team-invitation-create",
        ),
        path(
            "teams/<int:team_id>/active-invitations/",
            TeamActiveInvitationsView.as_view(),
            name="team-active-invitations",
        ),
        path(
            "team-invitations/<int:invitation_id>/",
            TeamInvitationDetailView.as_view(),
            name="team-invitation-detail",
        ),
        path(
            "team-invitations/<int:invitation_id>/accept/",
            AcceptInvitationView.as_view(),
            name="team-invitation-accept",
        ),
        path(
            "team-invitations/<int:invitation_id>/reject/",
            RejectInvitationView.as_view(),
            name="team-invitation-reject",
        ),
        path(
            "active-invitations/",
            MyActiveInvitationsView.as_view(),
            name="my-active-invitations",
        ),
        # Team Permissions
        path(
            "teams/<int:team_id>/permissions/",
            MyTeamPermissionsView.as_view(),
            name="my-team-permissions",
        ),
    ]
)
