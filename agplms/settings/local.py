from .base import *

INTERNAL_IPS = [
    '127.0.0.1',
]

INSTALLED_APPS += [
    'django_extensions'
]
DEBUG=True
CKEDITOR_UPLOAD_PATH = "uploads/"

MEDIA_ROOT = BASE_DIR / 'media'
