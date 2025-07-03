from rest_framework import serializers
from .models import Course, Track, Feature, TrackFeatureValue,Category

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
    category_name = serializers.CharField(source="category.name",read_only=True)
    class Meta:
        model = Course
        fields = ['id', 'name', 'summary','category_name','category','created_at']

        
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