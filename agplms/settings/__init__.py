from pathlib import Path
import environ
env = environ.Env()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env.read_env(BASE_DIR / '.env')
SETTINGS_MODULE = env('DJANGO_SETTINGS')
if SETTINGS_MODULE == 'agplms.settings.local':
    from .local import *
elif SETTINGS_MODULE == 'agplms.settings.production':
    from .production import *
else:
    raise ImportError("Invalid DJANGO_SETTINGS specified")
