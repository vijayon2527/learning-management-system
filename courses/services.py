from django.db import transaction
from .models import Course, Feature, TrackFeatureValue

def add_feature_to_course(course_id, feature_name, track_feature_values):
    course = Course.objects.get(id=course_id)

    with transaction.atomic():
        feature = Feature.objects.create(
            course=course,
            name=feature_name,
            order=Feature.objects.filter(course=course).count() + 1
        )

        active_tracks = course.tracks.filter(is_active=True)
        for track in active_tracks:
            value = track_feature_values.get(str(track.id))
            if value is not None and value != '':
                TrackFeatureValue.objects.create(
                    track=track,
                    feature=feature,
                    value=value
                )
    return feature

def update_feature_for_course(course_id, feature_id, track_feature_values):
    course = Course.objects.get(id=course_id)
    feature = Feature.objects.get(id=feature_id, course=course)

    with transaction.atomic():
        active_tracks = course.tracks.filter(is_active=True)
        for track in active_tracks:
            value = track_feature_values.get(str(track.id))
            if value is not None and value != '':
                track_feature, created = TrackFeatureValue.objects.get_or_create(
                    track=track,
                    feature=feature,
                    defaults={'value': value}
                )
                if not created and track_feature.value != value:
                    track_feature.value = value
                    track_feature.save()
            else:
                TrackFeatureValue.objects.filter(track=track, feature=feature).delete()
    return feature