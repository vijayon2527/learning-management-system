from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'tracks', TrackViewSet, basename='track')
router.register(r'features', FeatureViewSet, basename='feature')
router.register(r'feature-values', TrackFeatureValueViewSet, basename='feature-value')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r"sections", SectionViewSet, basename="section")
router.register(r"lectures",  LectureViewSet,  basename="lecture")
router.register(r'public-courses', PublicCourseViewSet, basename='public-courses')
router.register(r'notes', LectureNoteViewSet, basename='lecture-note')
router.register(r'reviews', CourseReviewViewSet,basename="course-review")
router.register(r'payment', PaymentViewSet, basename='payment')



urlpatterns = [
    path('', include(router.urls)),
]
