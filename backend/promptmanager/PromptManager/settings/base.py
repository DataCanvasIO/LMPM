import os.path
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-i-4&q0ek-x-()orfl^1*#-ldabiojq#13oy#%4&@bnqd-6!5o)"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    "testmodule",
    "app_chat",
    "app_flow",
    "app_model",
    "app_overview",
    "app_prompt",
    "app_app",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

MIDDLEWARE = [
    "promptmanager.exception.middleware.ExceptionMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    # "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "PromptManager.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "template")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "PromptManager.wsgi.application"

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = "/web/"

STATICFILES_DIRS = [
    # 静态资源存储的目录，比如我的是根目录下的 public_static
    os.path.join(BASE_DIR, 'web'),
]

# STATIC_ROOT = os.path.join(BASE_DIR, "web") # 静态资源绝对目录地址

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

APP_URL = "https://promptmanager.zetyun.cn/api/app/<appId>/run"

ALAYA_MODEL_CONFIG = "{\n    \"protocol\":  \"http\",\n    \"method\":  \"POST\",\n    \"url\":  \"${url}\",\n    \"header\":  {\n        \"ContentType\":  \"application/json\",\n        \"api_key\":  \"${ALAYA_API_KEY}\"\n    },\n    \"modelRole\":  {\n        \"user\":  \"user\",\n        \"system\":  \"system\",\n        \"assistant\":  \"assistant\"\n    },\n    \"requestBody\":  {\n        \"messages\":  ${message},\n        \"repetition_penalty\":  ${repetition_penalty},\n        \"temperature\":  ${temperature},\n        \"top_k\":  ${top_k},\n        \"top_p\":  ${top_p},\n        \"max_new_tokens\":  ${max_new_tokens}\n    },\n    \"responseBody\":  {\n        \"content\":  ${result}\n    },\n    \"responseErrorBody\":  {\n        \"code\":  -1,\n        \"message\":  \"${errorMessage}\",\n        \"stacktrace\":  \"\"\n    }\n}"
ALAYA_MODEL_PARAMS = "[{\"name\": \"url\", \"type\": \"String\", \"defaultValue\": \"\", \"value\": null}, {\"name\": \"ALAYA_API_KEY\", \"type\": \"Password\", \"defaultValue\": null, \"value\": null}, {\"name\": \"message\", \"type\": \"Jsonarray\", \"defaultValue\": [{\"role\": \"${role}\", \"content\": \"${content}\"}], \"value\":null}, {\"name\": \"repetition_penalty\", \"type\": \"Double\", \"defaultValue\": 1.2, \"value\": null}, {\"name\": \"temperature\", \"type\": \"Double\", \"defaultValue\": 0.7, \"value\": null}, {\"name\": \"top_k\", \"type\": \"Int\", \"defaultValue\": 10, \"value\": null}, {\"name\": \"top_p\", \"type\": \"Double\", \"defaultValue\": 0.5, \"value\": null}, {\"name\": \"max_new_tokens\", \"type\": \"Int\", \"defaultValue\": 20, \"value\": null}, {\"name\": \"result\", \"type\": \"Jsonarray\", \"defaultValue\": [{\"generated_text\": \"${result_content}\"}], \"value\": null}, {\"name\": \"errorMessage\", \"type\": \"String\", \"defaultValue\": null, \"value\": null}]"
OPENAI_MODEL_CONFIG = "{\n    \"protocol\":  \"https\",\n    \"method\":  \"POST\",\n    \"url\":  \"https://api.openai.com/v1/chat/completions\",\n    \"header\":  {\n        \"ContentType\":  \"application/json\",\n        \"Authorization\":  \"Bearer ${OPENAI_API_KEY}\"\n    },\n    \"modelRole\":  {\n        \"user\":  \"user\",\n        \"system\":  \"system\",\n        \"assistant\":  \"assistant\"\n    },\n    \"requestBody\":  {\n        \"model\":  \"${model}\",\n        \"messages\":  ${message},\n        \"temperature\":  ${temperature},\n        \"stream\":  ${stream}\n    },\n    \"responseBody\":  {\n        \"id\":  \"chatcmpl-7lZq4UwSCrkvyOTUcyReAMXpAydSQ\",\n        \"object\":  \"chat.completion\",\n        \"created\":  \"1691573536\",\n        \"model\":  \"gpt-3.5-turbo-0613\",\n        \"choices\":  ${result},\n        \"usage\":  {\n            \"prompt_tokens\":  36,\n            \"completion_tokens\":  104,\n            \"total_tokens\":  140\n        }\n    },\n    \"responseErrorBody\":  {\n        \"error\":  {\n            \"message\":  \"${errorMessage}\",\n            \"type\":  \"invalid_request_error\",\n            \"param\":  null,\n            \"code\":  null\n        }\n    },\n    \"responseStreamBody\":  {\n        \"id\":  \"chatcmpl-7lZq4UwSCrkvyOTUcyReAMXpAydSQ\",\n        \"object\":  \"chat.completion\",\n        \"created\":  \"1691573536\",\n        \"model\":  \"gpt-3.5-turbo-0613\",\n        \"choices\":  ${stream_result}\n    }\n}"
OPENAI_MODEL_PARAMS = "[{\"name\": \"OPENAI_API_KEY\", \"type\": \"Password\", \"defaultValue\": null, \"value\": null}, {\"name\": \"model\", \"type\": \"Select\", \"defaultValue\": \"gpt-3.5-turbo-0613;gpt-3.5-turbo;gpt-3.5-turbo-16k-0613;gpt-3.5-turbo-16k;gpt-4-0613;gpt-4-32k-0613;gpt-4;gpt-4-32k\", \"value\": null}, {\"name\": \"message\", \"type\": \"Jsonarray\", \"defaultValue\": [{\"role\": \"${role}\", \"content\": \"${content}\"}], \"value\":null}, {\"name\": \"temperature\", \"type\": \"Double\", \"defaultValue\": 0.7, \"value\": null}, {\"name\": \"stream\", \"type\": \"Boolean\", \"defaultValue\": true, \"value\": null}, {\"name\": \"result\", \"type\": \"Jsonarray\", \"defaultValue\": [{\"index\": 0,  \"message\": {\"role\": \"assistant\", \"content\": \"${result_content}\"},  \"finish_reason\": \"stop\"}], \"value\": null}, {\"name\": \"errorMessage\", \"type\": \"String\", \"defaultValue\": null, \"value\": null}, {\"name\": \"stream_result\", \"type\": \"Jsonarray\", \"defaultValue\": [{\"index\":0,\"delta\":{\"role\":\"assistant\",\"content\":\"${stream_content}\"},\"finish_reason\":null}], \"value\": null}]"

CHAT_READ_FILE_MAX_LENGTH = 4000
PROMPT_FILE_UPLOAD_ROOT_PATH = "/tmp/file"
PROMPT_FILE_UPLOAD_DEFAULT_PATH = "/tmp/prompt/default"
ALLOWED_EXTENSIONS = {'txt', 'doc', 'docx', 'xlsx', 'xls', 'xml', 'json', 'tsv', 'csv', 'md'}

CHATGPT_PROXY_HOST = 'http://192.168.3.212'
CHATGPT_PROXY_PORT = 1088

APP_FILE_UPLOAD_ROOT_PATH = "/tmp/promptmanager/upload"

OPTIMIZE_PROMPT_CONTENT = "Please optimize this sentence for me："
