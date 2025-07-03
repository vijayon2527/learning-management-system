from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.contrib.auth.models import Permission

from .models import User
from django.contrib.auth import authenticate

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

        # Authenticate user
        user = authenticate(email=attrs.get('email'), password=attrs.get('password'))
        if not user:
            raise AuthenticationFailed('Invalid credentials')
        data['role']=user.get_role()
        return data


class AGPTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh_token = RefreshToken(attrs['refresh'])

        # Extract user ID from token payload
        user_id = refresh_token.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid user associated with the token.")

        # Add role to the new access token
        access_token = refresh_token.access_token
        access_token['role'] = user.get_role()

        # Return the updated access token and role
        data['access'] = str(access_token)
        data['role'] = user.get_role()
        return data


class UserRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=255)
    last_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    department_id = serializers.IntegerField(required=False, allow_null=True)  # Optional
    role_id = serializers.IntegerField(required=False, allow_null=True)  # Optional

    def validate(self, data):
        """Validate password match."""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def validate_email(self, value):
        """Check if email already exists."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_password(self, value):
        """Validate password complexity."""
        if len(value) < 6:
            raise serializers.ValidationError("Password length should be at least 6 characters.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must include at least one number.")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must include at least one uppercase letter.")
        if not any(char.islower() for char in value):
            raise serializers.ValidationError("Password must include at least one lowercase letter.")
        if not any(char in "!@#$%^&*()-_=+<>?" for char in value):
            raise serializers.ValidationError("Password must include at least one special character.")
        return value

    def create(self, validated_data):
        department = None
        role = None

        if validated_data.get('department_id'):
            try:
                department = Department.objects.get(id=validated_data['department_id'])
            except Department.DoesNotExist:
                raise serializers.ValidationError({"department_id": "Department not found."})

        if validated_data.get('role_id'):
            try:
                role = Role.objects.get(id=validated_data['role_id'])
            except Role.DoesNotExist:
                raise serializers.ValidationError({"role_id": "Role not found."})

        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )

        if department:
            user.department = department
        if role:
            user.role = role
        user.save()

        # Generate JWT Token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return user

    @staticmethod
    def send_verification_email(email, token):
        """Send email verification link."""
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}/"
        subject = "Email Verification"
        message = f"Click the link to verify your email: {verification_url}"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]

        send_mail(subject, message, from_email, recipient_list)


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context['request'].user
        
        current_password = attrs.get('current_password')
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')
        
        if not user.check_password(current_password):
            raise ValidationError("Current password is incorrect.")
        
        if new_password != confirm_password:
            raise ValidationError("New password and confirm password do not match.")
        
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            raise ValidationError({'new_password': e.messages})
        
        return attrs
    

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active']


class UserUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=255, required=False)
    last_name = serializers.CharField(max_length=255, required=False)
    email = serializers.EmailField(required=False)
    department_id = serializers.IntegerField(required=False)
    role_id = serializers.IntegerField(required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'department_id', 'role_id']

    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_department_id(self, value):
        if not Department.objects.filter(id=value).exists():
            raise serializers.ValidationError("Department not found.")
        return value

    def validate_role_id(self, value):
        if not Role.objects.filter(id=value).exists():
            raise serializers.ValidationError("Role not found.")
        return value

    def update(self, instance, validated_data):
        if 'department_id' in validated_data:
            instance.department = Department.objects.get(id=validated_data.pop('department_id'))
        if 'role_id' in validated_data:
            instance.role = Role.objects.get(id=validated_data.pop('role_id'))

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class UserDeleteSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("User not found.")
        return value


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    profile_pic = serializers.ImageField(read_only=True) 

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'mobile', 'department',
            'role', 'date_of_birth', 'address_line_1', 'address_line_2', 'city', 'state',
            'country', 'postal_code', 'profile_pic'
        ]

    def validate_mobile(self, value):
        user = self.context['request'].user
        if User.objects.filter(mobile=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("This mobile number is already registered.")
        return value

    def update(self, instance, validated_data):
        if 'first_name' in validated_data:
            instance.first_name = validated_data['first_name']
        if 'last_name' in validated_data:
            instance.last_name = validated_data['last_name']
        if 'mobile' in validated_data:
            instance.mobile = validated_data['mobile']
        if 'profile_pic' in validated_data:
            instance.profile_pic = validated_data['profile_pic']
        if 'date_of_birth' in validated_data:
            instance.date_of_birth = validated_data['date_of_birth']
        if 'address_line_1' in validated_data:
            instance.address_line_1 = validated_data['address_line_1']
        if 'address_line_2' in validated_data:
            instance.address_line_2 = validated_data['address_line_2']
        if 'city' in validated_data:
            instance.city = validated_data['city']
        if 'state' in validated_data:
            instance.state = validated_data['state']
        if 'country' in validated_data:
            instance.country = validated_data['country']
        if 'postal_code' in validated_data:
            instance.postal_code = validated_data['postal_code']
        
        instance.save()
        return instance


class ProfilePictureSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['profile_pic']

















