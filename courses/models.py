from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


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


class Course(BaseModel):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="courses",
        verbose_name=_("Category"),
        help_text=_("Category to which this course belongs"),
    )
    summary = models.TextField(
        verbose_name=_("Summary"),
        help_text=_("Brief summary of the course content"),
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
        help_text=_("Whether this course is currently active"),
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
            models.Index(fields=["is_active"], name="course_is_active_idx"),
        ]
        ordering = ["name"]

    def __str__(self):
        return self.name


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
        validators=[MinValueValidator(0)],
        verbose_name=_("Fee"),
        help_text=_("Fee for the track in INR"),
    )
    recommended_for = models.TextField(
        blank=True,
        null=True,  # Added null=True for consistency
        verbose_name=_("Recommended For"),
        help_text=_("Target audience for the track (e.g., Beginners, Career Switchers)"),
    )
    description = models.TextField(
        blank=True,
        null=True,  # Added null=True for consistency
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
            models.Index(fields=["is_active"], name="track_is_active_idx"),
        ]
        ordering = ["course__name", "name"]


class Feature(models.Model):
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

    class Meta:
        verbose_name = _("Track Feature Value")
        verbose_name_plural = _("Track Feature Values")
        constraints = [
            models.UniqueConstraint(fields=["track", "feature"], name="unique_track_feature"),
        ]
        indexes = [
            models.Index(fields=["track", "feature"], name="track_feature_idx"),
        ]