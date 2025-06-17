from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission, Group
from django.contrib.sessions.models import Session
from django.contrib.admin.models import LogEntry
from django.shortcuts import get_object_or_404

from .models import User
from .serializers import (
    AGPTokenObtainPairSerializer,
    AGPTokenRefreshSerializer,
    UserDeleteSerializer,
    UserRegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
    UserSerializer,
    ProfileSerializer,
    ProfilePictureSerializer,
)


class AGPTokenObtainPairView(TokenObtainPairView):
    serializer_class = AGPTokenObtainPairSerializer


class AGPTokenRefreshView(TokenRefreshView):
    serializer_class = AGPTokenRefreshSerializer


class UserRegisterView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class VerifyEmailView(APIView):
    def get(self, request, token):
        try:
            payload = AccessToken(token)
            user_id = payload["user_id"]
            user = User.objects.get(id=user_id)
            if user.email_verified:
                return Response({"message": "Email already verified."})

            user.email_verified = True
            user.save()

            return Response({"message": "Email verified successfully."})
        except Exception as e:
            raise AuthenticationFailed("Invalid or expired token.")
        

class UserListView(APIView):
    def get(self, request):
        users = User.objects.all()
        if not users:
            return Response({"message": "No users found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserUpdateView(APIView):
    def put(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserUpdateSerializer(user, data=request.data, partial=False)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User updated successfully.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "department": user.department.name,
                    "role": user.role.name
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User updated successfully.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "department": user.department.name,
                    "role": user.role.name
                }
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    def get(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user)
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserDeleteView(APIView):
    def delete(self, request, pk, *args, **kwargs):
        serializer = UserDeleteSerializer(data={"user_id": pk})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.get(pk=pk)
        user.delete()

        return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class UserActivateDeactivateView(APIView):
    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        is_active = request.data.get("is_active")
        if not isinstance(is_active, bool):
            return Response({"message": "'is_active' must be true or false."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = is_active
        user.save()

        return Response({"message": f"User {'activated' if is_active else 'deactivated'}."}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    def get(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = ProfileSerializer(request.user)  
        return Response({
            "user": serializer.data
        }, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
           return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        serializer = ProfileSerializer(user, data=request.data, partial=True, context={'request': request})  

        if serializer.is_valid():
           user = serializer.save()  
           return Response({
               "message": "User profile updated successfully.",
               "user": serializer.data
            }, status=status.HTTP_200_OK)
    
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfilePictureView(APIView):
    
    def get(self, request, *args, **kwargs):
        
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        profile_pic_url = user.profile_pic.url if user.profile_pic else None

        return Response({
            "profile_pic": profile_pic_url
        }, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        
        serializer = ProfilePictureSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            user = serializer.save()

            return Response({
                "message": "Profile picture updated successfully.",
                "profile_pic": serializer.data['profile_pic']
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
