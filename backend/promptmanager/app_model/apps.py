from django.apps import AppConfig


class ModelConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "promptmanager.app_model"
