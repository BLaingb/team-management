from rest_framework import serializers
from .models import Team, TeamMember, TeamRole, TeamInvitation
from django.contrib.auth import get_user_model

User = get_user_model()


class TeamRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamRole
        fields = ["id", "name", "description"]


class TeamMemberUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "phone_number"]

    def get_full_name(self, obj):
        return obj.get_full_name()


class TeamMemberSerializer(serializers.ModelSerializer):
    user = TeamMemberUserSerializer()
    role = TeamRoleSerializer()

    class Meta:
        model = TeamMember
        fields = ["user", "role"]


class TeamSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = "__all__"

    def get_members(self, obj):
        members = TeamMember.objects.filter(team=obj)
        return TeamMemberSerializer(members, many=True).data


class TeamInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamInvitation
        fields = [
            "id",
            "team",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "status",
            "created_at",
            "expires_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at", "expires_at"]

    def validate(self, data):
        team = data["team"]
        email = data["email"]
        if TeamMember.objects.is_user_member(team, email):
            raise serializers.ValidationError(
                "This user is already a member of the team."
            )
        if TeamInvitation.objects.has_pending_or_accepted_invitation(team, email):
            raise serializers.ValidationError(
                "There is already a pending or accepted invitation for this email and team."
            )
        return data
