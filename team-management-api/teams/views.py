from rest_framework import viewsets
from .models import Team
from .serializers import TeamSerializer

class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer

    def get_queryset(self):
        user = self.request.user
        return Team.objects.filter(teammember__user=user)
