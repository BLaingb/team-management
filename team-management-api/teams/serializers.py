from rest_framework import serializers
from .models import Team, TeamMember, TeamRole
from django.contrib.auth import get_user_model

User = get_user_model()

class TeamRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamRole
        fields = ['id', 'name', 'description']

class TeamMemberUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone_number']

    def get_full_name(self, obj):
        return obj.get_full_name()

class TeamMemberSerializer(serializers.ModelSerializer):
    user = TeamMemberUserSerializer()
    role = TeamRoleSerializer()

    class Meta:
        model = TeamMember
        fields = ['user', 'role']

class TeamSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = '__all__'

    def get_members(self, obj):
        members = TeamMember.objects.filter(team=obj)
        return TeamMemberSerializer(members, many=True).data