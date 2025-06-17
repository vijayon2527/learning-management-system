from django.utils.text import slugify
from django.core.exceptions import ValidationError


def generate_unique_slug(instance, source_field='name', slug_field='slug'):
    source_value = getattr(instance, source_field, None)

    if not source_value:
        raise ValueError(f"{source_field} cannot be empty")

    slug = slugify(source_value)
    unique_slug = slug
    num = 1

    # Check for existing slugs
    while instance.__class__.objects.filter(**{slug_field: unique_slug}).exists():
        unique_slug = f"{slug}-{num}"
        num += 1

    return unique_slug


def validate_file_extension(value, valid_extensions=None):
    import os
    ext = os.path.splitext(value.name)[1].lower()
    if valid_extensions and ext not in valid_extensions:
        raise ValidationError(f'Unsupported file extension. Allowed: {", ".join(valid_extensions)}')


def validate_video_extension(value):
    return validate_file_extension(value, ['.mp4', '.mov', '.avi'])


def validate_document_extension(value):
    return validate_file_extension(value, ['.pdf', '.doc', '.docx', '.ppt', '.pptx'])