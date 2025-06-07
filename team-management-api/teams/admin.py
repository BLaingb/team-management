from django.contrib import admin
from .models import Team, TeamMember, TeamRole

# Register your models here.
admin.site.register(TeamRole)
admin.site.register(Team)
admin.site.register(TeamMember)
