from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .serializers import (
    CustomTokenObtainPairSerializer,
    CustomTokenRefreshSerializer,
    CustomTokenVerifySerializer,
    UserSerializer,
    UserSignupSerializer,
)
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny


# JWT Auth Views
# Should go in a separate auth app, to keep it simple I've put it here
class HttpOnlyCookieTokenObtainPairView(TokenObtainPairView):
    """
    Custom view to obtain access and refresh tokens and set them as HttpOnly cookies.
    """

    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )

        access_token = serializer.access_token
        refresh_token = serializer.refresh_token

        response = Response(status=status.HTTP_200_OK)

        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_ACCESS"],
            value=str(access_token),
            expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=True,
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
            value=str(refresh_token),
            expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=True,
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        user_data = UserSerializer(serializer.user).data

        response.data = user_data

        return response


class HttpOnlyCookieTokenVerifyView(TokenVerifyView):
    """
    Custom view to verify access token and set it as HttpOnly cookie.
    """

    serializer_class = CustomTokenVerifySerializer

    def post(self, request, *args, **kwargs):
        access_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE_ACCESS"])
        if not access_token:
            return Response(
                {"detail": "Access token not provided in cookies"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"token": access_token})

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            token = AccessToken(access_token)
            user_id = token["user_id"]
            User = get_user_model()
            user = User.objects.get(id=user_id)
            user_data = UserSerializer(user).data
        except Exception as e:
            return Response(
                {"detail": "User not found or token invalid"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = Response(status=status.HTTP_200_OK)
        response.data = user_data
        return response


class HttpOnlyCookieTokenRefreshView(TokenRefreshView):
    """
    Custom view to refresh access token and set it as HttpOnly cookie.
    """

    serializer_class = CustomTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])
        if not refresh_token:
            return Response(
                {"detail": "Refresh token not provided in cookies"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {"detail": "Invalid refresh token or not provided"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access_token = serializer.access_token

        response = Response(status=status.HTTP_200_OK)

        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_ACCESS"],
            value=str(access_token),
            expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=True,
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        response.data = {"message": "Access token refreshed successfully"}
        return response


class HttpOnlyCookieLogoutView(TokenRefreshView):
    """
    View to clear JWT cookies (logout).
    """

    permission_classes = ()

    def post(self, request):
        response = Response(
            {"detail": "Successfully logged out."}, status=status.HTTP_200_OK
        )

        response.delete_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_ACCESS"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )
        response.delete_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        return response


class SignupView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    """
    View to register a new user.
    """

    def post(self, request, *args, **kwargs):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = CustomTokenObtainPairSerializer.get_token(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            response = Response(status=status.HTTP_201_CREATED)
            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_COOKIE_ACCESS"],
                value=access_token,
                expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                httponly=True,
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            )
            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
                value=refresh_token,
                expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                httponly=True,
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            )
            user_data = UserSerializer(user).data
            response.data = user_data
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
