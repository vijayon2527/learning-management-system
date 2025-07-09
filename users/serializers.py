from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from django.contrib.auth.models import Permission
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings
from .models import User


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OtpVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class AGPTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.get_role()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        user = authenticate(email=attrs.get('email'), password=attrs.get('password'))
        if not user:
            raise AuthenticationFailed('Invalid credentials')
        data['role']=user.get_role()
        return data


class AGPTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh_token = RefreshToken(attrs['refresh'])

        user_id = refresh_token.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid user associated with the token.")

        access_token = refresh_token.access_token
        access_token['role'] = user.get_role()

        data['access'] = str(access_token)
        data['role'] = user.get_role()
        return data



















