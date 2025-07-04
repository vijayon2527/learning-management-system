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
from django.contrib.auth import authenticate
from decouple import config
import requests
import logging

from .models import *
from .serializers import (
    AGPTokenObtainPairSerializer,
    AGPTokenRefreshSerializer,
    OtpVerifySerializer
)


from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from decouple import config
import requests
import logging
import random
from django.utils import timezone
from datetime import timedelta

from .utils import send_otp_email

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


    
    


class SendOtpView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=400)

        user = authenticate(email=email, password=password)

        if not user:
            return Response({"error": "Invalid email or password."}, status=401)

        # ✅ If authenticated, send OTP
        otp_code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timedelta(minutes=5)

        Otp.objects.create(user=user, otp_code=otp_code, expires_at=expires_at)
        send_otp_email(email, otp_code)

        response_data = {"message": "OTP sent to your email."}

        if settings.DEBUG:
            response_data["otp"] = otp_code  # 👈 Include OTP in dev only

        return Response(response_data, status=200)

class VerifyOtpView(APIView):
    def post(self, request):
        serializer = OtpVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            try:
                user = User.objects.get(email=email)
                latest_otp = Otp.objects.filter(user=user).order_by('-created_at').first()

                if not latest_otp:
                    return Response({"error": "No OTP found."}, status=400)
                if latest_otp.is_expired():
                    return Response({"error": "OTP has expired."}, status=400)
                if latest_otp.otp_code != otp:
                    return Response({"error": "Invalid OTP."}, status=400)

                latest_otp.delete()

                user.is_active = True
                user.save()

                return Response({"message": "OTP verified. You may now login."}, status=200)

            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=404)

        return Response(serializer.errors, status=400)
