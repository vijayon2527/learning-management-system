from rest_framework import status,permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from decouple import config
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
import requests

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone

from .models import *
from .serializers import (
    AGPTokenObtainPairSerializer,
    AGPTokenRefreshSerializer,
    OtpVerifySerializer,
    UserSerializer,
    UserRegisterSerializer,
    UserUpdateSerializer,
    StudentRegisterSerializer

)

import logging
import random
from datetime import timedelta

from .utils import send_otp_email

logger = logging.getLogger(__name__)

User = get_user_model()

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


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

        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response(UserSerializer(request.user).data)


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


class UserMetaChoicesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "genders": [{"value": v, "label": l} for v, l in User.Gender.choices],
            "user_types": [{"value": v, "label": l} for v, l in User.UserType.choices],
            "platform_roles": [{"value": v, "label": l} for v, l in PlatformUser.Role.choices],
            "education_levels": [{"value": v, "label": l} for v, l in Student.EducationLevel.choices],
        })


class UserRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User registered successfully.",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentRegisterView(APIView):
    def post(self, request):
        serializer = StudentRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Student registered successfully.",
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "mobile": user.mobile,
                    "gender": user.gender,
                    "user_type": user.user_type,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = User.objects.all().select_related('platform_user', 'student')
        serializer = UserSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            user = User.objects.select_related('platform_user', 'student').get(pk=pk)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class UserUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk, *args, **kwargs):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk, *args, **kwargs):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, partial):
        try:
            user = User.objects.select_related('platform_user', 'student').get(pk=pk)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserUpdateSerializer(
            instance=user,
            data=request.data,
            partial=partial,
        )
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User updated successfully.",
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class UserActivateDeactivateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        is_active = request.data.get("is_active")
        if not isinstance(is_active, bool):
            return Response({"is_active": ["Must be true or false."]}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = is_active
        user.save(update_fields=["is_active"])
        return Response({
            "message": f"User {'activated' if is_active else 'deactivated'}.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    return Response(UserSerializer(request.user).data)