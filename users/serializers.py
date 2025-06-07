from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer, TokenVerifySerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        self.access_token = data["access"]
        self.refresh_token = data["refresh"]

        return data


class CustomTokenVerifySerializer(TokenVerifySerializer):
    pass


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        self.access_token = data["access"]
        return data