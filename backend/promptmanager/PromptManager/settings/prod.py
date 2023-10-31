from .base import *

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": "/data/db/db.sqlite3",
    }
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            # 'filename': os.path.join(BASE_DIR, "prompt.log"),
            'filename': '/var/log/promptmanager/backend/prompt.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
        'pm_log':{
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        }
    },
}

MODEL_PROXY = 'http://172.20.10.248:1080'
