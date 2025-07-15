from rest_framework import generics, status, viewsets,permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend


from .models import *
from .serializers import (
    CategorySerializer,
    CourseSerializer,
    FeatureSerializer,
    TrackFeatureValueSerializer,
    TrackFeatureValueUpdateSerializer,
    TrackSerializer,
    SectionSerializer,
    LectureSerializer,
    CourseReviewSerializer,
)



class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by("name")
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category"]
    lookup_field = 'slug'



class TrackViewSet(viewsets.ModelViewSet):
    serializer_class   = TrackSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Track.objects.select_related("course").order_by("created_at")
        course_id = self.request.query_params.get("course_id")
        return qs.filter(course_id=course_id) if course_id else qs

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)


class FeatureViewSet(viewsets.ModelViewSet):
    serializer_class   = FeatureSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Feature.objects.select_related("course").order_by("order")
        course_id = self.request.query_params.get("course_id")
        return qs.filter(course_id=course_id) if course_id else qs


class TrackFeatureValueViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields   = {
        "track__course_id": ["exact"],
        "track_id":         ["exact"],
        "feature_id":       ["exact"],
    }
    search_fields      = ["value"]

    def get_queryset(self):
        qs = (
            TrackFeatureValue.objects
            .select_related("track", "feature", "track__course", "feature__course")
            .order_by("id")
        )
        course_id = self.request.query_params.get("course_id")
        return qs.filter(track__course_id=course_id) if course_id else qs

    def get_serializer_class(self):
        return (
            TrackFeatureValueUpdateSerializer
            if self.request.method in ("POST", "PUT", "PATCH")
            else TrackFeatureValueSerializer
        )


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.select_related("track", "track__course")
    serializer_class = SectionSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering = ["track", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        track_id = self.request.query_params.get("track")
        if track_id:
            qs = qs.filter(track_id=track_id)
        return qs


class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.select_related("section", "section__track", "section__track__course")
    serializer_class = LectureSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering = ["section", "order"]

    def get_queryset(self):
        qs = super().get_queryset()
        section_id = self.request.query_params.get("section")
        if section_id:
            qs = qs.filter(section_id=section_id)
        return qs

    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder(self, request):
        order_data = request.data.get("order", [])

        if not isinstance(order_data, list):
            return Response({"error": "Invalid order format"}, status=400)

        try:
            with transaction.atomic():
                # Step 1: temporarily move order values out of conflict range
                temp_offset = 1000  # ensure it's higher than any current order

                for idx, item in enumerate(order_data):
                    Lecture.objects.filter(id=item["id"]).update(order=temp_offset + idx)

                # Step 2: apply correct final order
                for item in order_data:
                    Lecture.objects.filter(id=item["id"]).update(order=item["order"])

            return Response({"message": "Order updated successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=400)
        


class CourseReviewViewSet(viewsets.ModelViewSet):
    queryset = CourseReview.objects.all()
    serializer_class = CourseReviewSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
import razorpay
import hashlib
import hmac

from django.conf import settings
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

class PaymentViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]  # Require login for payments

    @action(detail=False, methods=["post"], url_path="create-order")
    def create_order(self, request):
        user = request.user
        track_id = request.data.get("track_id")

        if not track_id:
            return Response({"error": "track_id is required"}, status=400)

        try:
            track = Track.objects.get(id=track_id)
        except Track.DoesNotExist:
            return Response({"error": "Invalid track ID"}, status=400)

        # Check if user is already enrolled for this track/course
        enrollment_exists = Enrollment.objects.filter(user=user, course=track.course).exists()
        if enrollment_exists:
            return Response({"error": "User already enrolled for this course"}, status=400)

        # (Optional) Check for existing pending payment orders here if you keep track of orders

        amount = int(float(track.fee) * 100)  # convert to paise

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        order = client.order.create({
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1
        })

        return Response({
            "order_id": order["id"],
            "amount": amount,
            "currency": "INR",
            "razorpay_key": settings.RAZORPAY_KEY_ID,
            "track_id": track.id,
            "course_id": track.course.id,
        })

    @action(detail=False, methods=["post"], url_path="verify", permission_classes=[permissions.IsAuthenticated])
    def verify_payment(self, request):
        user = request.user
        data = request.data
        order_id = data.get("razorpay_order_id")
        payment_id = data.get("razorpay_payment_id")
        signature = data.get("razorpay_signature")
        track_id = data.get("track_id")

        if not all([order_id, payment_id, signature, track_id]):
            return Response({"error": "Missing required fields"}, status=400)

        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{order_id}|{payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()

        if expected_signature != signature:
            return Response({"error": "Invalid signature"}, status=400)

        try:
            track = Track.objects.get(id=track_id)
        except Track.DoesNotExist:
            return Response({"error": "Invalid track ID"}, status=400)

        # Double-check enrollment to prevent duplicates
        enrollment_exists = Enrollment.objects.filter(user=user, course=track.course).exists()
        if enrollment_exists:
            return Response({"message": "Already enrolled."})

        Enrollment.objects.create(
            user=user,
            course=track.course,
            track=track
        )

        return Response({"message": "Payment verified and enrollment successful."})
