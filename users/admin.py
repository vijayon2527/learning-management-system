from django.contrib import admin
from .models import User, PlatformUser, Student

admin.site.register((User, PlatformUser, Student))