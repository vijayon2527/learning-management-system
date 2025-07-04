from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from google.auth.transport import requests as google_requests
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from google.auth.transport import requests
from google.oauth2 import id_token
from django.conf import settings
from decouple import config
import requests
import logging

from .models import User
from .serializers import (
    AGPTokenObtainPairSerializer,
    AGPTokenRefreshSerializer,
)


logger = logging.getLogger(__name__)

User = get_user_model()


class AGPTokenObtainPairView(TokenObtainPairView):
    serializer_class = AGPTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        provider = request.data.get("provider", "").lower()
        access_token = request.data.get("access_token")
        code = request.data.get("code")

        if provider in ["google", "github", "facebook"]:
            try:
                email = name = None

                if provider == "github":
                    if code:
                        token_response = requests.post(
                            "https://github.com/login/oauth/access_token",
                            data={
                                "client_id": config("REACT_APP_GITHUB_CLIENT_ID"),
                                "client_secret": config("GITHUB_CLIENT_SECRET"),
                                "code": code,
                            },
                            headers={"Accept": "application/json"},
                        )
                        token_data = token_response.json()
                        access_token = token_data.get("access_token")
                        if not access_token:
                            return Response({"detail": "GitHub token exchange failed"}, status=400)

                    user_data = requests.get(
                        'https://api.github.com/user',
                        headers={'Authorization': f'token {access_token}'}
                    ).json()

                    email_data = requests.get(
                        'https://api.github.com/user/emails',
                        headers={'Authorization': f'token {access_token}'}
                    ).json()

                    email = next((e['email'] for e in email_data if e.get('primary')), None)
                    name = user_data.get("name") or user_data.get("login")

                elif provider == "google":
                    idinfo = id_token.verify_oauth2_token(access_token, google_requests.Request())
                    email = idinfo.get("email")
                    name = idinfo.get("name")

                elif provider == "facebook":
                    fb_data = requests.get(
                        f'https://graph.facebook.com/me?fields=id,name,email&access_token={access_token}'
                    ).json()
                    email = fb_data.get("email")
                    name = fb_data.get("name")

                if not email:
                    return Response({"detail": "Email not found from provider"}, status=400)

                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={"first_name": name or "FacebookUser", "user_type": "STUDENT"}
                )

                refresh = RefreshToken.for_user(user)
                refresh["role"] = user.get_role() if hasattr(user, "get_role") else "unknown"

                return Response({
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "role": refresh["role"],
                })

            except Exception as e:
                logger.exception("Social login failed")
                return Response({"detail": str(e)}, status=400)

        return super().post(request, *args, **kwargs)


class AGPTokenRefreshView(TokenRefreshView):
    serializer_class = AGPTokenRefreshSerializer

        

class SetPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        new_password = request.data.get("password")

        if not new_password:
            return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)

        user.password = make_password(new_password)
        user.save()
        return Response({"message": "Password set successfully"}, status=status.HTTP_200_OK)


