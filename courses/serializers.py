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


class LectureSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source="section.name", read_only=True)
    track_name = serializers.CharField(source="section.track.name", read_only=True)
    course_name = serializers.CharField(source="section.track.course.name", read_only=True)
    course_logo = serializers.SerializerMethodField()  # ✅ renamed here
    video_url = serializers.SerializerMethodField()

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
            "course_logo", 
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
            "id", "order", "duration",
            "created_at", "updated_at",
            "section_name", "track_name", "course_name",
        )

    def get_video_url(self, obj):
        request = self.context.get("request")
        if obj.video and hasattr(obj.video, "url"):
            return request.build_absolute_uri(obj.video.url) if request else obj.video.url
        return None

    def get_course_logo(self, obj):  # ✅ renamed method
        request = self.context.get("request")
        course = obj.section.track.course
        if course.logo:  # ✅ use `logo` instead of `thumbnail`
            return request.build_absolute_uri(course.logo.url) if request else course.logo.url
        return None  # or return a default logo URL

class SectionSerializer(serializers.ModelSerializer):
    track_name = serializers.CharField(source="track.name", read_only=True)
    course_name = serializers.CharField(source="track.course.name", read_only=True)
    lectures = LectureSerializer(many=True, read_only=True)  # ✅ Explicitly add this

    class Meta:
        model = Section
        fields = (
            "id", "track", "name", "description",
            "is_locked", "unlock_criteria", "order",
            "estimated_duration", "created_at", "updated_at",
            "track_name", "course_name", "is_active",
            "lectures",  
        )
        read_only_fields = (
            "id", "order", "estimated_duration",
            "created_at", "updated_at", "track_name", "course_name",
        )


class PublicCourseSerializer(serializers.ModelSerializer):
    instructor = serializers.CharField(source='instructor.get_full_name', default='Instructor')
    instructor_profile_pic = serializers.SerializerMethodField()
    lectures_count = serializers.SerializerMethodField()
    total_hours = serializers.SerializerMethodField()
    promotional_video = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'name', 'description', 'thumbnail', 'logo', 'promotional_video', 'average_rating',
            'slug', 'instructor', 'instructor_profile_pic', 'estimated_duration', 'lectures_count',
            'total_hours', 'enrolled_students', 'visibility'
        ]

    def get_promotional_video(self, obj):
        request = self.context.get('request')
        if obj.promotional_video and hasattr(obj.promotional_video, 'url'):
            return request.build_absolute_uri(obj.promotional_video.url)
        return None

    def get_thumbnail(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and hasattr(obj.thumbnail, 'url'):
            return request.build_absolute_uri(obj.thumbnail.url)
        return None

    def get_logo(self, obj):
        request = self.context.get('request')
        if obj.logo and hasattr(obj.logo, 'url'):
            return request.build_absolute_uri(obj.logo.url)
        return None

    def get_instructor_profile_pic(self, obj):
        request = self.context.get('request')
        instructor = obj.instructor
        if instructor and instructor.profile_pic and hasattr(instructor.profile_pic, 'url'):
            return request.build_absolute_uri(instructor.profile_pic.url)
        return None  # Or return a default image path if needed

    def get_lectures_count(self, obj):
        return (
            Section.objects.filter(track__course=obj)
            .prefetch_related('lectures')
            .aggregate(count=Count('lectures'))['count'] or 0
        )

    def get_total_hours(self, obj):
        duration = obj.estimated_duration
        if duration:
            total_minutes = duration.total_seconds() // 60
            return f"{total_minutes // 60}h {total_minutes % 60}m"
        return None


class LectureNoteSerializer(serializers.ModelSerializer):
    timestamp = serializers.CharField()  # accept string from frontend

    class Meta:
        model = LectureNote
        fields = ['id', 'user', 'lecture', 'timestamp', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_timestamp(self, value):
        try:
            h, m, s = map(int, value.strip().split(":"))
            return timedelta(hours=h, minutes=m, seconds=s)
        except:
            raise serializers.ValidationError("Timestamp must be in HH:MM:SS format")

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    

class CourseReviewSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    user = serializers.IntegerField(source='user.id', read_only=True)
    text = serializers.CharField(source='comment', allow_blank=True, required=False)

    class Meta:
        model = CourseReview
        fields = [
            'id',
            'user',
            'first_name',
            'course',
            'track',       # optional
            'rating',
            'text',        # maps to comment
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'first_name', 'created_at']

    def validate(self, attrs):
       
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        course = attrs.get('course') or getattr(self.instance, 'course', None)

        if self.instance is None:
            # create
            if user and course and CourseReview.objects.filter(user=user, course=course).exists():
                raise serializers.ValidationError("You have already reviewed this course.")
        return attrs

    
