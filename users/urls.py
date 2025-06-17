from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from  .import  views

urlpatterns = [
    path('token/', views.AGPTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.AGPTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('register/', views.UserRegisterView.as_view(), name='user_register'),
    path('verify-email/<str:token>/', views.VerifyEmailView.as_view()),
    path('list/', views.UserListView.as_view(), name='user_list'),
    path('update/<int:pk>/', views.UserUpdateView.as_view(), name='user_update'),
    path('detail/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('delete/<int:pk>/', views.UserDeleteView.as_view(), name='user_delete'), 
    path('activate-deactivate/<int:pk>/', views.UserActivateDeactivateView.as_view(), name='user_activate_deactivate'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile_pic/',views.ProfilePictureView.as_view(),name='user_profilepic'),

]