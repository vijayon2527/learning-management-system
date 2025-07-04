from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrackViewSet, FeatureViewSet, TrackFeatureValueViewSet,CourseViewSet,CategoryViewSet

router = DefaultRouter()
router.register(r'tracks', TrackViewSet, basename='track')
router.register(r'features', FeatureViewSet, basename='feature')
router.register(r'feature-values', TrackFeatureValueViewSet, basename='feature-value')
router.register(r'category', CategoryViewSet, basename='category')
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    path('api/', include(router.urls)),
]
