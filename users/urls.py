from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from  .import  views

urlpatterns = [
    path('token/', views.AGPTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.AGPTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('set-password/', views.SetPasswordView.as_view(), name='set-password'),

]