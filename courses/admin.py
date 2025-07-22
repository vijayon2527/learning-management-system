from django.contrib import admin
from courses.models import *

admin.site.register((Category, Course, Track,  Feature, TrackFeatureValue,Section,Lecture,LectureNote,CourseReview))
