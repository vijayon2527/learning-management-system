from rest_framework import viewsets
from .serializers import CategorySerializer, CourseSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import *
from rest_framework import viewsets, generics,status
from .serializers import (
    TrackSerializer, FeatureSerializer,
    TrackFeatureValueSerializer, 
    TrackFeatureValueUpdateSerializer,
    CourseSerializer,
    CategorySerializer
)



class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by("name")
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category"]



class TrackViewSet(viewsets.ModelViewSet):  
    queryset = Track.objects.all().order_by('created_at') 
    serializer_class = TrackSerializer

    def partial_update(self, request, *args, **kwargs):
        """
        This allows PATCH method to update is_active or any partial field.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def toggle_active(self, request, pk=None):
        track = self.get_object()
        track.is_active = not track.is_active
        track.save()
        return Response({"id": track.id, "is_active": track.is_active})


class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer


class TrackFeatureValueViewSet(viewsets.ModelViewSet):
    queryset = TrackFeatureValue.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH', 'POST']:
            return TrackFeatureValueUpdateSerializer
        return TrackFeatureValueSerializer

    def get_queryset(self):
        course_id = self.request.query_params.get("course_id")
        if course_id:
            return self.queryset.filter(track__course_id=course_id)
        return self.queryset
