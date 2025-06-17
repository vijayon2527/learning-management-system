from .base import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=env('SENTRY_DSN'),
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    traces_sample_rate=1.0,
    # Set profiles_sample_rate to 1.0 to profile 100%
    # of sampled transactions.
    # We recommend adjusting this value in production.
    profiles_sample_rate=1.0,
    integrations=[DjangoIntegration()]  
)

ALLOWED_HOSTS = [
    'agplms.com',
    'www.agplms.com',
]

CSRF_TRUSTED_ORIGINS = [
    'https://agplms.com',
    'https://www.agplms.com',
]
DEBUG=False

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True

STATIC_ROOT = '/home/agplms/public_html/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = '/home/agplms/public_html/media/'
