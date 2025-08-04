from rest_framework import generics, status, viewsets,permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.contrib.staticfiles import finders
from django.template.loader import render_to_string
import tempfile
import razorpay
from weasyprint import HTML
from .models import Payment, Track
from .serializers import PaymentSerializer
from django.conf import settings


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
    PublicCourseSerializer,
    LectureNoteSerializer,
    CourseReviewSerializer,
    EnrollmentSerializer
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.conf import settings
import razorpay
import hashlib
import hmac




class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    lookup_field = 'slug'



class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by("name")
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category__slug"]
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
    filterset_fields = ["track"]
    ordering = ["track", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        track_id = self.request.query_params.get("track")
        course_slug = self.request.query_params.get("course_slug")  # ✅ new param

        if track_id:
            qs = qs.filter(track_id=track_id)
        elif course_slug:
            qs = qs.filter(track__course__slug=course_slug)  # ✅ filter by slug via foreign key relation

        if self.request.query_params.get("include_lectures"):
            qs = qs.prefetch_related("lectures")

        return qs

    def get_serializer(self, *args, **kwargs):
        # Pass context to allow serializer access request if needed
        return self.serializer_class(*args, context=self.get_serializer_context(), **kwargs)

    @action(detail=True, methods=["get"], url_path="lectures")
    def get_lectures(self, request, pk=None):
        section = self.get_object()
        lectures = Lecture.objects.filter(section=section).order_by("order")
        serializer = LectureSerializer(lectures, many=True)
        return Response(serializer.data)
    

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
        

class PublicCourseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PublicCourseSerializer
    permission_classes = [permissions.IsAuthenticated]  # require login
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Course.objects.none()

        # Return only courses where the user has an enrollment
        return Course.objects.filter(
            enrollment_open=True,
            enrollments__user=user,
        ).distinct()

class LectureNotePagination(PageNumberPagination):
    page_size = 5  # ✅ Only 5 per page


class LectureNoteViewSet(viewsets.ModelViewSet):
    serializer_class = LectureNoteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LectureNotePagination  # ✅ Use custom pagination

    def get_queryset(self):
        lecture_id = self.request.query_params.get("lecture")
        qs = LectureNote.objects.filter(user=self.request.user).order_by("-created_at")
        if lecture_id:
            qs = qs.filter(lecture_id=lecture_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CourseReviewViewSet(viewsets.ModelViewSet):
    queryset = CourseReview.objects.select_related('user', 'course', 'track')
    serializer_class = CourseReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required to review."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        course_id = request.data.get('course')
        if not course_id:
            return Response(
                {"detail": "Course is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing = CourseReview.objects.filter(
            user=request.user, course_id=course_id
        ).first()
        if existing:
            data = self.get_serializer(existing).data
            return Response(
                {
                    "detail": "You have already reviewed this course.",
                    "review": data,
                },
                status=status.HTTP_400_BAD_REQUEST,  # or 200 if you prefer
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        Allow only owner or staff to edit.
        """
        instance = self.get_object()
        user = request.user
        if not user.is_authenticated or (not user.is_staff and instance.user_id != user.id):
            raise PermissionDenied("You do not own this review.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Allow owner or staff.
        """
        instance = self.get_object()
        user = request.user
        if not user.is_authenticated or (not user.is_staff and instance.user_id != user.id):
            raise PermissionDenied("You do not own this review.")
        return super().destroy(request, *args, **kwargs)
    



razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_API_KEY, settings.RAZORPAY_API_SECRET))

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def get_track_fee(self, request):
        track_id = request.query_params.get('track_id')
        if not track_id:
            return Response({'error': 'track_id is required'}, status=400)

        try:
            track = Track.objects.get(id=track_id)
            return Response({
                'track_id': track.id,
                'track_name': track.name,
                'fee': float(track.fee),
                'currency': 'INR',
            })
        except Track.DoesNotExist:
            return Response({'error': 'Invalid track id'}, status=400)


    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def initiate(self, request):
        track_id = request.data.get('track_id')

        if not track_id:
            return Response({'error': 'track_id is required'}, status=400)

        try:
            track = Track.objects.get(id=track_id)
            amount = int(float(track.fee) * 100)
            currency = 'INR'

            # ❌ Prevent re-enrollment if already completed
            completed_payment = Payment.objects.filter(
                user=request.user,
                track=track,
                status='Completed'
            ).first()

            if completed_payment:
                return Response({'error': 'You have already enrolled in this track.'}, status=400)


            # Look for existing payment with status 'Pending' or 'Processing'
            existing_payment = Payment.objects.filter(
            user=request.user if request.user.is_authenticated else None,
            track=track,
            status__in=['Pending', 'Processing']
            ).first()


            if existing_payment:
                return Response({
                    'payment_id': existing_payment.id,
                    'razorpay_order_id': existing_payment.razorpay_order_id,
                    'razorpay_merchant_key': settings.RAZORPAY_API_KEY,
                    'razorpay_amount': int(existing_payment.amount * 100),
                    'razorpay_display_amount': existing_payment.amount,
                    'currency': existing_payment.currency,
                    'user_name': request.user.get_full_name(),
                    'user_email': request.user.email,
                    'track_name': existing_payment.track.name,
                })

            # Create new razorpay order
            razorpay_order = razorpay_client.order.create({
                'amount': amount,
                'currency': currency,
                'payment_capture': '0'
            })

            # Create unique order number (UUID)
            unique_order_number = str(uuid.uuid4())

            # Now create new Payment with razorpay_order_id and unique order_number
            payment = Payment.objects.create(
                user=request.user,
                razorpay_order_id=razorpay_order['id'],
                amount=amount / 100,
                currency=currency,
                track=track,
                status='Pending',
                order_number=unique_order_number,  # <--- Important fix here
            )

            return Response({
                'payment_id': payment.id,
                'razorpay_order_id': razorpay_order['id'],
                'razorpay_merchant_key': settings.RAZORPAY_API_KEY,
                'razorpay_amount': amount,
                'razorpay_display_amount': amount / 100,
                'currency': currency,
                'user_name': request.user.get_full_name(),
                'user_email': request.user.email,
                'track_name': track.name,
            })

        except Track.DoesNotExist:
            return Response({'error': 'Invalid track id'}, status=400)

    @action(detail=False, methods=['post'])
    def verify(self, request):
        payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        signature = request.data.get('razorpay_signature')

        if not all([payment_id, razorpay_order_id, signature]):
            return Response({'error': 'Missing razorpay payment details'}, status=status.HTTP_400_BAD_REQUEST)

        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature,
        }

        try:
            razorpay_client.utility.verify_payment_signature(params_dict)

            try:
                payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            except Payment.DoesNotExist:
                return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

            amount = int(payment.amount * 100)
            razorpay_client.payment.capture(payment_id, amount)

            payment.razorpay_payment_id = payment_id
            payment.razorpay_signature = signature
            payment.status = 'Completed'
            payment.save()
            track = payment.track
            course = track.course
            user = payment.user

            enrollment, created = Enrollment.objects.get_or_create(
                user=user,
                course=course,
                defaults={'track': track}
            )

            if not created and enrollment.track is None:
                enrollment.track = track
                enrollment.save(update_fields=["track"])
            return Response({'status': 'success'})

        except razorpay.errors.SignatureVerificationError:
            payment = Payment.objects.filter(razorpay_order_id=razorpay_order_id).first()
            if payment:
                payment.status = 'Failed'
                payment.save()
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        payment = get_object_or_404(Payment, id=pk, user=request.user)

        org_details = {
            'name': "DigitalBeans",
            'address': "123 Tech Park, Bengaluru, Karnataka - 560001",
            'gstin': "22ABCDE1234F1Z5",
            'phone': "+91 9876543210",
            'email': "accounts@digitalbeans.in",
            'logo': finders.find('img/logo.png'),
        }

        context = {
            'payment': payment,
            'org': org_details,
            'today': timezone.now().date(),
        }

        html_string = render_to_string('payment/receipt_pdf.html', context)
        html = HTML(string=html_string, base_url=request.build_absolute_uri())
        pdf_result = html.write_pdf()

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Payment_Receipt_{payment.id}.pdf"'
        response['Content-Transfer-Encoding'] = 'binary'

        with tempfile.NamedTemporaryFile(delete=True) as output:
            output.write(pdf_result)
            output.flush()
            output.seek(0)
            response.write(output.read())

        return response


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="my-enrollments")
    def my_enrollments(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(user=user)
        data = [
            {"course_id": e.course.id, "track_id": e.track.id if e.track else None}
            for e in enrollments
        ]
        return Response(data)