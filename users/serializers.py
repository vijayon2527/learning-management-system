from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *


class PlatformUserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformUser
        fields = ["role"]


class StudentReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["education_level", "institution", "field_of_study",
                  "graduation_year", "is_premium", "premium_expiry",
                  "points", "last_active"]


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    platform_user = PlatformUserReadSerializer(read_only=True)
    student = StudentReadSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "mobile",
            "first_name",
            "last_name",
            "user_type",
            "gender",
            "profile_pic",
            "is_active",
            "date_joined",
            "email_verified",
            "role",
            "platform_user",
            "student",
        ]

    def get_role(self, obj):
        profile = obj.get_profile()
        return getattr(profile, "role", None) if profile else None



class UserRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=255, required=False, allow_blank=True)

    # Email *required* because your UserManager.create_user() enforces it.
    email = serializers.EmailField(required=True)
    mobile = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    user_type = serializers.ChoiceField(choices=User.UserType.choices)

    # PLATFORM extras
    role = serializers.ChoiceField(
        choices=PlatformUser.Role.choices,
        required=False,
        allow_null=True,
        allow_blank=True,
    )

    # STUDENT extras
    education_level = serializers.ChoiceField(
        choices=Student.EducationLevel.choices,
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    institution = serializers.CharField(required=False, allow_blank=True)
    field_of_study = serializers.CharField(required=False, allow_blank=True)
    graduation_year = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, data):
        # Password match
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        # Email uniqueness
        email = data.get("email")
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})

        # Platform requires role
        if data.get("user_type") == User.UserType.PLATFORM and not data.get("role"):
            raise serializers.ValidationError({"role": "Role is required for platform users."})

        return data

    def create(self, validated_data):
        role = validated_data.pop("role", None)
        education_level = validated_data.pop("education_level", None)
        institution = validated_data.pop("institution", "")
        field_of_study = validated_data.pop("field_of_study", "")
        graduation_year = validated_data.pop("graduation_year", None)

        password = validated_data.pop("password")
        validated_data.pop("confirm_password", None)

        # create_user() enforces email not None — we validated above.
        user = User.objects.create_user(
            email=validated_data.get("email"),
            password=password,
            mobile=validated_data.get("mobile"),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            user_type=validated_data.get("user_type"),
        )

        # Create related profile
        if user.user_type == User.UserType.PLATFORM:
            PlatformUser.objects.create(user=user, role=role or PlatformUser.Role.ADMIN)

        elif user.user_type == User.UserType.STUDENT:
            Student.objects.create(
                user=user,
                education_level=education_level or None,
                institution=institution or "",
                field_of_study=field_of_study or "",
                graduation_year=graduation_year,
            )

        return user


class StudentRegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "first_name", "last_name", "email", "mobile", "gender",
            "password", "confirm_password"
        ]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        validate_password(data["password"])
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            email=validated_data["email"],
            mobile=validated_data.get("mobile"),
            gender=validated_data.get("gender"),
            user_type="STUDENT",
            password=validated_data["password"],
        )
        return user


class UserUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    mobile = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gender = serializers.ChoiceField(choices=User.Gender.choices, required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False)

    user_type = serializers.ChoiceField(choices=User.UserType.choices, required=False)

    # PLATFORM extras
    role = serializers.ChoiceField(
        choices=PlatformUser.Role.choices,
        required=False,
        allow_null=True,
        allow_blank=True,
    )

    # STUDENT extras
    education_level = serializers.ChoiceField(
        choices=Student.EducationLevel.choices,
        required=False,
        allow_null=True,
        allow_blank=True,
    )
    institution = serializers.CharField(required=False, allow_blank=True)
    field_of_study = serializers.CharField(required=False, allow_blank=True)
    graduation_year = serializers.IntegerField(required=False, allow_null=True)

    def validate_email(self, value):
        user = self.instance  # passed in via serializer = UserUpdateSerializer(instance=user,...)
        if value and User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def update(self, instance, validated_data):
        # Basic attributes
        for attr in ("first_name", "last_name", "email", "mobile", "gender", "is_active"):
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])

        # Determine requested user_type (if omitted, keep current)
        requested_user_type = validated_data.get("user_type", instance.user_type)
        instance.user_type = requested_user_type
        instance.save()

        # Clean up / create profile depending on requested_user_type
        if requested_user_type == User.UserType.PLATFORM:
            # Remove student profile if exists
            Student.objects.filter(user=instance).delete()
            role = validated_data.get("role", None)
            PlatformUser.objects.update_or_create(
                user=instance,
                defaults={
                    "role": role or PlatformUser.Role.ADMIN
                }
            )

        elif requested_user_type == User.UserType.STUDENT:
            # Remove platform profile if exists
            PlatformUser.objects.filter(user=instance).delete()
            Student.objects.update_or_create(
                user=instance,
                defaults={
                    "education_level": validated_data.get("education_level", None),
                    "institution": validated_data.get("institution", ""),
                    "field_of_study": validated_data.get("field_of_study", ""),
                    "graduation_year": validated_data.get("graduation_year", None),
                }
            )

        else:  # GENERIC
            PlatformUser.objects.filter(user=instance).delete()
            Student.objects.filter(user=instance).delete()

        return instance


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
        token['user_type'] = user.user_type
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        user = authenticate(email=attrs.get('email'), password=attrs.get('password'))
        if not user:
            raise AuthenticationFailed('Invalid credentials')
        data['role']=user.get_role()
        data['user_type'] = user.user_type 
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
        access_token['user_type'] = user.user_type

        data['access'] = str(access_token)
        data['role'] = user.get_role()
        data['user_type'] = user.user_type 
        return data



















