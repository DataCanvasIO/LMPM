"""
URL configuration for PromptManager project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path

from promptmanager.app_chat import views

urlpatterns = [
    path("model/configuration", views.model_configuration, name="model_configuration"),
    path("model/sync/completions", views.sync_chat_completions, name="sync_chat_completions"),
    path("model/upload/file", views.upload_file, name="upload_file"),
    path("model/async/completions", views.async_chat_completions, name="async_chat_completions"),
]
