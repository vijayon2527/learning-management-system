from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from  .import  views

from .views import (
     UserMetaChoicesView,
    UserRegisterView,
    UserListView,
    UserDetailView,
    UserUpdateView,
    UserDeleteView,
    UserActivateDeactivateView,
    StudentRegisterView
)

urlpatterns = [
    path('token/', views.AGPTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.AGPTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    path('meta/', UserMetaChoicesView.as_view(), name='user-meta'),
    path('register/', UserRegisterView.as_view(), name='user_register'),
    path("student/register/", StudentRegisterView.as_view(), name="student-register"),
    path('list/', UserListView.as_view(), name='user-list'),
    path('user-detail/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('user-update/<int:pk>/', UserUpdateView.as_view(), name='user-update'),
    path('delete/<int:pk>/', UserDeleteView.as_view(), name='user-delete'),
    path('activate-deactivate/<int:pk>/', UserActivateDeactivateView.as_view(), name='user-activate-deactivate'),



    path('set-password/', views.SetPasswordView.as_view(), name='set-password'),
    path('send-otp/', views.SendOtpView.as_view(), name='send-otp'),
    path('verify-otp/', views.VerifyOtpView.as_view(), name='verify-otp'),
    path('me/', views.current_user, name='current-user'),
    path('profile/', views.user_profile, name='user-profile'),

]