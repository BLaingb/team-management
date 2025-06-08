from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, TeamInvitationCreateView, TeamRoleViewSet

router = DefaultRouter()
router.register(r"teams", TeamViewSet, basename="team")
router.register(r"team-roles", TeamRoleViewSet, basename="team-role")

urlpatterns = router.urls + [
    path(
        "team-invitations/",
        TeamInvitationCreateView.as_view(),
        name="team-invitation-create",
    ),
]
