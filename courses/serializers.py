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
        fields = [
            "id",
            "name",
            "summary",
            "logo",         
            "category",
            "category_name",
            "is_active",
            "created_at",
            "updated_at",
        ]

        
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



from rest_framework import serializers
from courses.models import Section          # adjust import path to your project


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Section
        fields = '__all__'
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs):
        media_type = attrs.get("media_type", getattr(self.instance, "media_type", None))
        file = attrs.get("file", getattr(self.instance, "file", None))
        url = attrs.get("external_url", getattr(self.instance, "external_url", None))

        if media_type in ("video", "image", "file") and not file:
            raise serializers.ValidationError(
                {"file": "File upload is required for the selected media type."}
            )

        if media_type == "link" and not url:
            raise serializers.ValidationError(
                {"external_url": "External URL is required for link type."}
            )

        return attrs
