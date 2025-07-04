from django.contrib import admin
from .models import User, PlatformUser, Student,Otp

admin.site.register((User, PlatformUser, Student,Otp))