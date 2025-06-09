from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    HttpOnlyCookieTokenObtainPairView,
    HttpOnlyCookieTokenRefreshView,
    HttpOnlyCookieLogoutView,
    HttpOnlyCookieTokenVerifyView,
    SignupView,
)


router = DefaultRouter()

urlpatterns = router.urls

urlpatterns += [
    path(
        "token/", HttpOnlyCookieTokenObtainPairView.as_view(), name="token_obtain_pair"
    ),
    path(
        "token/refresh/", HttpOnlyCookieTokenRefreshView.as_view(), name="token_refresh"
    ),
    path("token/verify/", HttpOnlyCookieTokenVerifyView.as_view(), name="token_verify"),
    path("logout/", HttpOnlyCookieLogoutView.as_view(), name="logout"),
    path("signup/", SignupView.as_view(), name="signup"),
]
