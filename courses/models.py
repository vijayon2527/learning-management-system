from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.db.models import Sum, Max
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Count
from users.models import User
from agplms.utils.functions import generate_unique_slug

class BaseModel(models.Model):
    name = models.CharField(
        max_length=200,
        unique=True,
        verbose_name=_("Name"),
        help_text=_("Unique name for the entity"),
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
        help_text=_("Indicates whether this entity is active"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Created At")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Updated At")
    )

    class Meta:
        abstract = True
        

class Category(BaseModel):
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='subcategories',
        null=True,
        blank=True,
        verbose_name=_("Parent Category"),
        help_text=_("Parent category for nested structures"),
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Description"),
        help_text=_("Optional description of the category"),
    )
    logo = models.ImageField(
    upload_to='category_logos/',
    null=True,
    blank=True,
    verbose_name=_("Logo"),
    help_text=_("Optional logo image for this category"),
    )

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        indexes = [
            models.Index(fields=["name"], name="category_name_idx"),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.parent and self.parent == self:
            raise ValidationError(_("A category cannot be its own parent."))
        super().save(*args, **kwargs)

class CourseVisibility(models.TextChoices):
    PAID = "paid", _("Paid")
    FREE = "free", _("Free")

class Course(BaseModel):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="courses",
        verbose_name=_("Category"),
        help_text=_("Category to which this course belongs"),
    )
    slug = models.SlugField(
        max_length=255,
        unique=True,
        verbose_name=_("Slug"),
        help_text=_("URL-friendly identifier for the course"),
    )
    summary = models.TextField(
        verbose_name=_("Summary"),
        help_text=_("Brief summary of the course content"),
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Description"),
        help_text=_("Detailed description of the course"),
    )
    instructor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="courses_taught",
        verbose_name=_("Instructor"),
        help_text=_("Instructor teaching the course"),
    )
    thumbnail = models.ImageField(
        upload_to=lambda instance, filename: f"course_thumbnails/{instance.slug}/{filename}",
        null=True,
        blank=True,
        verbose_name=_("Thumbnail"),
        help_text=_("Course thumbnail image"),
    )
    promotional_video = models.FileField(
        upload_to=lambda instance, filename: f"promotional_videos/{instance.slug}/{filename}",
        null=True,
        blank=True,
        verbose_name=_("Promotional Video"),
        help_text=_("Promotional video for the course"),
    )
    visibility = models.CharField(
        max_length=20,
        choices=CourseVisibility.choices,
        default=CourseVisibility.PAID,
        verbose_name=_("Visibility"),
        help_text=_("Whether the course is free or paid"),
    )
    enrollment_open = models.BooleanField(
        default=True,
        verbose_name=_("Enrollment Open"),
        help_text=_("Whether enrollment is open for this course"),
    )
    estimated_duration = models.DurationField(
        null=True,
        blank=True,
        verbose_name=_("Estimated Duration"),
        help_text=_("Total estimated duration of the course"),
    )
    average_rating = models.FloatField(
        default=0.0,
        verbose_name=_("Average Rating"),
        help_text=_("Average user rating for the course"),
    )
    enrolled_students = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Enrolled Students"),
        help_text=_("Number of students enrolled in the course"),
    )
    logo = models.ImageField(
        upload_to='course_logos/',
        null=True,
        blank=True,
        verbose_name=_("Logo"),
        help_text=_("Optional logo image for this course"),
    )
    class Meta:
        verbose_name = _("Course")
        verbose_name_plural = _("Courses")
        indexes = [
            models.Index(fields=["name"], name="course_name_idx"),
            models.Index(fields=["category"], name="course_category_idx"),
            models.Index(fields=["slug"], name="course_slug_idx"),
        ]
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.slug or (self.pk and self.name != Course.objects.get(pk=self.pk).name):
                self.slug = slugify(self.name)
            super().save(*args, **kwargs)
            if self.sections.exists():
                self.estimated_duration = self.calculate_total_duration()
                super().save(update_fields=["estimated_duration"])

    def calculate_total_duration(self):
        return self.sections.aggregate(total=Sum("estimated_duration"))["total"] or timedelta(0)

class Track(BaseModel):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="tracks",
        verbose_name=_("Course"),
        help_text=_("Course to which this track belongs"),
    )
    name = models.CharField(
        max_length=200,
        verbose_name=_("Track Name"),
        help_text=_("Name of the track (e.g., Foundation, Professional)"),
    )
    fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name=_("Fee"),
        help_text=_("Fee for the track in INR"),
    )
    recommended_for = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Recommended For"),
        help_text=_("Target audience for the track (e.g., Beginners, Career Switchers)"),
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Description"),
        help_text=_("Detailed description of the track"),
    )
    is_active = models.BooleanField(
        default=False,
        verbose_name=_("Is Active"),
        help_text=_("Indicates whether the track is active"),
    )

    def __str__(self):
        return f"{self.name} - {self.course.name}"

    class Meta:
        verbose_name = _("Track")
        verbose_name_plural = _("Tracks")
        constraints = [
            models.UniqueConstraint(fields=["course", "name"], name="unique_track_course_name"),
        ]
        indexes = [
            models.Index(fields=["course", "name"], name="track_course_name_idx"),
        ]
        ordering = ["course__name", "name"]

class Feature(BaseModel):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="features",
        verbose_name=_("Course"),
        help_text=_("Course to which this feature belongs"),
    )
    name = models.CharField(
        max_length=200,
        verbose_name=_("Feature Name"),
        help_text=_("Name of the feature (e.g., Live Mentor Sessions, Certification)"),
    )
    order = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_("Display Order"),
        help_text=_("Order in which the feature appears in comparison tables"),
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Feature")
        verbose_name_plural = _("Features")
        constraints = [
            models.UniqueConstraint(fields=["course", "name"], name="unique_feature_course_name"),
        ]
        indexes = [
            models.Index(fields=["course", "name"], name="feature_course_name_idx"),
            models.Index(fields=["order"], name="feature_order_idx"),
        ]
        ordering = ["order", "name"]


class TrackFeatureValue(models.Model):
    track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name="feature_values",
        verbose_name=_("Track"),
        help_text=_("Track to which this feature value applies"),
    )
    feature = models.ForeignKey(
        Feature,
        on_delete=models.CASCADE,
        related_name="track_values",
        verbose_name=_("Feature"),
        help_text=_("Feature associated with this value"),
    )
    value = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Value"),
        help_text=_("Value of the feature for the track (e.g., 'Yes', 'No', '3 sessions')"),
    )

    def __str__(self):
        return f"{self.feature.name} for {self.track.name}: {self.value or 'N/A'}"

    def clean(self):
        if self.feature.course != self.track.course:
            raise ValidationError(_("Feature must belong to the same course as the track."))

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = _("Track Feature Value")
        verbose_name_plural = _("Track Feature Values")
        constraints = [
            models.UniqueConstraint(fields=["track", "feature"], name="unique_track_feature"),
        ]
        indexes = [
            models.Index(fields=["track", "feature"], name="track_feature_idx"),
        ]

class Section(BaseModel):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="sections",
        verbose_name=_("Course"),
        help_text=_("Course to which this section belongs"),
    )
    name = models.CharField(
        max_length=200,
        verbose_name=_("Section Name"),
        help_text=_("Name of the section"),
    )
    order = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_("Order"),
        help_text=_("Order of the section within the course"),
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Description"),
        help_text=_("Optional description of the section"),
    )
    estimated_duration = models.DurationField(
        default=timedelta(0),
        verbose_name=_("Estimated Duration"),
        help_text=_("Estimated duration of the section"),
    )
    is_locked = models.BooleanField(
        default=False,
        verbose_name=_("Is Locked"),
        help_text=_("Whether this section is locked for non-enrolled users"),
    )
    unlock_criteria = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Unlock Criteria"),
        help_text=_("JSON defining unlock conditions (e.g., sequential completion)"),
    )

    class Meta:
        verbose_name = _("Section")
        verbose_name_plural = _("Sections")
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(fields=["course", "name"], name="unique_section_course_name"),
            models.UniqueConstraint(fields=["course", "order"], name="unique_section_course_order"),
        ]
        indexes = [
            models.Index(fields=["course", "order"], name="section_course_order_idx"),
        ]

    def __str__(self):
        return f"{self.course.name} - {self.name}"

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.order:
                max_order = self.course.sections.aggregate(Max("order"))["order__max"] or 0
                self.order = max_order + 1
            if self.lectures.exists():
                self.estimated_duration = self.calculate_duration()
            super().save(*args, **kwargs)

    def calculate_duration(self):
        return self.lectures.aggregate(total=Sum("duration"))["total"] or timedelta(0)

class Lecture(BaseModel):
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="lectures",
        verbose_name=_("Section"),
        help_text=_("Section to which this lecture belongs"),
    )
    name = models.CharField(
        max_length=200,
        verbose_name=_("Lecture Name"),
        help_text=_("Name of the lecture"),
    )
    video = models.FileField(
        upload_to=lambda instance, filename: f"lecture_videos/{instance.section.course.slug}/{filename}",
        verbose_name=_("Lecture Video"),
        help_text=_("Video for the lecture"),
    )
    order = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_("Order"),
        help_text=_("Order of the lecture within the section"),
    )
    duration = models.DurationField(
        default=timedelta(0),
        verbose_name=_("Duration"),
        help_text=_("Duration of the lecture"),
    )
    is_preview = models.BooleanField(
        default=False,
        verbose_name=_("Is Preview"),
        help_text=_("Whether this lecture is free for non-enrolled users"),
    )
    release_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Release Date"),
        help_text=_("Date when the lecture becomes available (for drip content)"),
    )
    prerequisites = models.ManyToManyField(
        "self",
        symmetrical=False,
        blank=True,
        verbose_name=_("Prerequisites"),
        help_text=_("Other lectures that must be completed before this one"),
    )
    is_locked = models.BooleanField(
        default=False,
        verbose_name=_("Is Locked"),
        help_text=_("Whether this lecture is locked for non-enrolled users"),
    )
    unlock_criteria = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Unlock Criteria"),
        help_text=_("JSON defining unlock conditions"),
    )

    class Meta:
        verbose_name = _("Lecture")
        verbose_name_plural = _("Lectures")
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(fields=["section", "name"], name="unique_lecture_section_name"),
            models.UniqueConstraint(fields=["section", "order"], name="unique_lecture_section_order"),
        ]
        indexes = [
            models.Index(fields=["section", "order"], name="lecture_section_order_idx"),
            models.Index(fields=["is_preview"], name="lecture_is_preview_idx"),
            models.Index(fields=["release_date"], name="lecture_release_date_idx"),
        ]

    def __str__(self):
        return f"{self.section.name} - {self.name}"

    def clean(self):
        for prereq in self.prerequisites.all():
            if prereq.section.course != self.section.course:
                raise ValidationError(_("Prerequisites must belong to the same course."))

    def save(self, *args, **kwargs):
        with transaction.atomic():
            self.clean()
            if not self.order:
                max_order = self.section.lectures.aggregate(Max("order"))["order__max"] or 0
                self.order = max_order + 1
            super().save(*args, **kwargs)

    def is_accessible(self, user):
        if self.is_preview or not self.is_locked:
            return True
        if not user.is_authenticated:
            return False
        if self.release_date and timezone.now() < self.release_date:
            return False
        if self.unlock_criteria.get("type") == "sequential":
            for prereq in self.prerequisites.all():
                if not LectureCompletion.objects.filter(user=user, lecture=prereq).exists():
                    return False
        return Enrollment.objects.filter(user=user, course=self.section.course).exists()

class Enrollment(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="enrollments",
        verbose_name=_("User"),
        help_text=_("User enrolled in the course"),
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments",
        verbose_name=_("Course"),
        help_text=_("Course in which the user is enrolled"),
    )
    track = models.ForeignKey(
        Track,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="enrollments",
        verbose_name=_("Track"),
        help_text=_("Track selected by the user, if applicable"),
    )
    enrolled_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Enrolled At"),
        help_text=_("Date and time of enrollment"),
    )
    progress = models.FloatField(
        default=0.0,
        verbose_name=_("Progress"),
        help_text=_("Percentage of course completion"),
    )
    completed = models.BooleanField(
        default=False,
        verbose_name=_("Completed"),
        help_text=_("Whether the course is completed"),
    )

    class Meta:
        verbose_name = _("Enrollment")
        verbose_name_plural = _("Enrollments")
        constraints = [
            models.UniqueConstraint(fields=["user", "course"], name="unique_user_course_enrollment"),
        ]
        indexes = [
            models.Index(fields=["user", "course"], name="enrollment_user_course_idx"),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.course.name}"

    def update_progress(self):
        total_lectures = self.course.sections.aggregate(total_lectures=Count("lectures"))["total_lectures"] or 0
        if total_lectures == 0:
            self.progress = 100 if self.completed else 0
        else:
            completed_lectures = self.user.lecture_completions.filter(lecture__section__course=self.course).count()
            self.progress = (completed_lectures / total_lectures) * 100
        self.completed = self.progress >= 100
        self.save(update_fields=["progress", "completed"])

class LectureCompletion(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="lecture_completions",
        verbose_name=_("User"),
        help_text=_("User who completed the lecture"),
    )
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="completions",
        verbose_name=_("Lecture"),
        help_text=_("Lecture that was completed"),
    )
    completed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Completed At"),
        help_text=_("Date and time of completion"),
    )

    class Meta:
        verbose_name = _("Lecture Completion")
        verbose_name_plural = _("Lecture Completions")
        constraints = [
            models.UniqueConstraint(fields=["user", "lecture"], name="unique_user_lecture_completion"),
        ]
        indexes = [
            models.Index(fields=["user", "lecture"], name="completion_user_lecture_idx"),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.lecture.name}"

@receiver(post_save, sender=LectureCompletion)
def update_enrollment_progress(sender, instance, **kwargs):
    enrollment = Enrollment.objects.filter(
        user=instance.user,
        course=instance.lecture.section.course
    ).first()
    if enrollment:
        enrollment.update_progress()