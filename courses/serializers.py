from rest_framework import serializers
from .models import *


class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source="parent.name", read_only=True)
    logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "logo",         
            "parent",
            "parent_name",
            "is_active",
            "created_at",
            "updated_at",
        ]


class CourseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Course
        fields = '__all__'

class CourseReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = CourseReview
        fields = [
            "id",
            "course",
            "track",
            "user",
            "user_name",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "user_name"]

class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = '__all__' 


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['id', 'name', 'order', 'course']


class TrackFeatureValueSerializer(serializers.ModelSerializer):
    track = TrackSerializer()
    feature = FeatureSerializer()

    class Meta:
        model = TrackFeatureValue
        fields = ['id', 'track', 'feature', 'value']


class TrackFeatureValueUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackFeatureValue
        fields = ['id', 'track', 'feature', 'value']


class SectionSerializer(serializers.ModelSerializer):
    track_name = serializers.CharField(source="track.name", read_only=True)
    course_name = serializers.CharField(source="track.course.name", read_only=True)

    class Meta:
        model = Section
        fields = (
            "id", "track", "name", "description",
            "is_locked", "unlock_criteria", "order",
            "estimated_duration", "created_at", "updated_at",
            "track_name", "course_name","is_active",  
        )
        read_only_fields = (
            "id", "order", "estimated_duration",
            "created_at", "updated_at", "track_name", "course_name",
        )


class LectureSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source="section.name", read_only=True)
    track_name   = serializers.CharField(source="section.track.name", read_only=True)
    course_name  = serializers.CharField(source="section.track.course.name", read_only=True)
    video_url    = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = (
            "id",
            "section",
            "section_name",
            "track_name",
            "course_name",
            "name",
            "video",        
            "video_url",     
            "order",
            "duration",
            "is_preview",
            "release_date",
            "is_locked",
            "unlock_criteria",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "order",
            "duration",
            "created_at",
            "updated_at",
            "section_name",
            "track_name",
            "course_name",
        )

    def get_video_url(self, obj):
        request = self.context.get("request")
        if obj.video and hasattr(obj.video, 'url'):
            return request.build_absolute_uri(obj.video.url)
        return None
