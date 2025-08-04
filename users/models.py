from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth import get_user_model

import uuid
from django.utils.crypto import get_random_string


class UserManager(BaseUserManager):
    def _create_user(self, email, password=None, mobile=None, **extra_fields):
        if not email:
            raise ValueError(_('An email address must be provided.'))
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            mobile=mobile,
            **extra_fields
        )
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, mobile=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, mobile, **extra_fields)

    def create_superuser(self, email, password=None, mobile=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields['is_staff'] is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields['is_superuser'] is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self._create_user(email, password, mobile, **extra_fields)

    def get_with_profile(self, **kwargs):
        return self.select_related(
            'platform_user',
            'student'
        ).get(**kwargs)

    def filter_with_profiles(self, **kwargs):
        return self.select_related(
            'platform_user',
            'student'
        ).filter(**kwargs)


class User(AbstractBaseUser, PermissionsMixin):
    class UserType(models.TextChoices):
        PLATFORM = 'PLATFORM', _('Platform')
        STUDENT = 'STUDENT', _('Student')
        GENERIC = 'GENERIC', _('Generic')

    class Gender(models.TextChoices):
        MALE = 'MALE', _('Male')
        FEMALE = 'FEMALE', _('Female')
        OTHER = 'OTHER', _('Other')
        PNS = 'PNS', _('Prefer not to say')

    user_type = models.CharField(
        max_length=30,
        choices=UserType.choices,
        default=UserType.GENERIC
    )
    email = models.EmailField(
        _('email address'),
        unique=True,
        null=True,
        blank=True
    )
    mobile = models.CharField(
        _('mobile number'),
        max_length=15,
        unique=True,
        null=True,
        blank=True
    )
    first_name = models.CharField(
        _('first name'),
        max_length=255,
        blank=True,
        null=True
    )
    last_name = models.CharField(
        _('last name'),
        max_length=255,
        blank=True,
        null=True
    )
    gender = models.CharField(
        max_length=6,
        choices=Gender.choices,
        blank=True,
        null=True
    )
    profile_pic = models.ImageField(
        upload_to='user_profile_pics/%Y/%m/%d/',
        blank=True,
        null=True
    )
    date_of_birth = models.DateField(
        _('date of birth'),
        blank=True,
        null=True
    )
    address_line_1 = models.CharField(
        _('address line 1'),
        max_length=255,
        blank=True,
        null=True
    )
    address_line_2 = models.CharField(
        _('address line 2'),
        max_length=255,
        blank=True,
        null=True
    )
    city = models.CharField(
        _('city'),
        max_length=100,
        blank=True,
        null=True
    )
    state = models.CharField(
        _('state'),
        max_length=50,
        blank=True,
        null=True
    )
    country = models.CharField(
        _('country'),
        max_length=100,
        blank=True,
        null=True
    )
    postal_code = models.CharField(
        _('postal code'),
        max_length=20,
        blank=True,
        null=True
    )
    is_active = models.BooleanField(
        _('active'),
        default=True
    )
    is_staff = models.BooleanField(
        _('staff status'),
        default=False
    )
    date_joined = models.DateTimeField(
        _('date joined'),
        default=timezone.now
    )
    email_verified = models.BooleanField(
        _('email verified'),
        default=False
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['mobile']),
            models.Index(fields=['user_type'])
        ]

    def __str__(self):
        return self.email or self.mobile or f"User {self.id}"

    def get_full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip() or str(self)

    def get_short_name(self):
        return self.first_name or str(self)

    def clean(self):
        if not (self.email or self.mobile):
            raise ValidationError(_('At least one of email or mobile must be provided.'))

        type_profile_map = {
            self.UserType.PLATFORM: 'platform_user',
            self.UserType.STUDENT: 'student'
        }

        if self.user_type in type_profile_map:
            profile_attr = type_profile_map[self.user_type]
            if not hasattr(self, profile_attr):
                raise ValidationError(_(f'Users with type {self.user_type} must have a {profile_attr} profile.'))
        elif self.user_type == self.UserType.GENERIC:
            if any(hasattr(self, attr) for attr in type_profile_map.values()):
                raise ValidationError(_('Generic users must not have any profile.'))

    def get_profile(self):
        if self.user_type == self.UserType.PLATFORM and hasattr(self, 'platform_user'):
            return self.platform_user
        elif self.user_type == self.UserType.STUDENT and hasattr(self, 'student'):
            return self.student
        return None

    def get_role(self):
        profile = self.get_profile()
        if profile and hasattr(profile, 'role'):
            return profile.role
        return None


class PlatformUser(models.Model):
    class Role(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', _('Super Admin')
        ADMIN = 'ADMIN', _('Admin')
        INSTRUCTOR = 'INSTRUCTOR', _('Instructor')
        CONTENT_MANAGER = 'CONTENT_MANAGER', _('Content Manager')
        SUPPORT_STAFF = 'SUPPORT_STAFF', _('Support Staff')
        MODERATOR = 'MODERATOR', _('Moderator')
        ANALYST = 'ANALYST', _('Analyst')

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='platform_user'
    )
    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.ADMIN
    )

    class Meta:
        verbose_name = _('platform user')
        verbose_name_plural = _('platform users')

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_role_display()}"

    def save(self, *args, **kwargs):
        self.user.user_type = User.UserType.PLATFORM
        self.user.save(update_fields=['user_type'])
        super().save(*args, **kwargs)

    def is_super_admin(self):
        return self.role == self.Role.SUPER_ADMIN


class Student(models.Model):
    class EducationLevel(models.TextChoices):
        HIGH_SCHOOL = 'HIGH_SCHOOL', _('High School')
        UNDERGRADUATE = 'UNDERGRADUATE', _('Undergraduate')
        GRADUATE = 'GRADUATE', _('Graduate')
        POST_GRADUATE = 'POST_GRADUATE', _('Post Graduate')
        DOCTORATE = 'DOCTORATE', _('Doctorate')
        OTHER = 'OTHER', _('Other')

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='student'
    )
    education_level = models.CharField(
        max_length=20,
        choices=EducationLevel.choices,
        blank=True,
        null=True
    )
    institution = models.CharField(
        _('institution'),
        max_length=255,
        blank=True
    )
    field_of_study = models.CharField(
        _('field of study'),
        max_length=255,
        blank=True
    )
    graduation_year = models.PositiveIntegerField(
        _('graduation year'),
        blank=True,
        null=True
    )
    interests = models.TextField(
        _('interests'),
        blank=True
    )
    goals = models.TextField(
        _('learning goals'),
        blank=True
    )
    is_premium = models.BooleanField(
        _('is premium member'),
        default=False
    )
    premium_expiry = models.DateField(
        _('premium expiry date'),
        blank=True,
        null=True
    )
    points = models.PositiveIntegerField(
        _('reward points'),
        default=0
    )
    last_active = models.DateTimeField(
        _('last active'),
        default=timezone.now
    )

    referral_code = models.CharField(max_length=10, unique=True, blank=True, null=True)
    referred_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='referrals'
    )

    class Meta:
        verbose_name = _('student')
        verbose_name_plural = _('students')
        indexes = [
            models.Index(fields=['education_level']),
            models.Index(fields=['last_active'])
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} - Student"

    def save(self, *args, **kwargs):
        self.user.user_type = User.UserType.STUDENT
        self.user.save(update_fields=['user_type'])
        super().save(*args, **kwargs)

    def get_education_info(self):
        parts = []
        if self.education_level:
            parts.append(self.get_education_level_display())
        if self.field_of_study:
            parts.append(self.field_of_study)
        if self.institution:
            parts.append(f"at {self.institution}")
        if self.graduation_year:
            parts.append(f"(Graduating {self.graduation_year})")
        return ' '.join(parts) or _('No education information provided')

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = get_random_string(8).upper()
        self.user.user_type = User.UserType.STUDENT
        self.user.save(update_fields=['user_type'])
        super().save(*args, **kwargs)



User = get_user_model()

class Otp(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at