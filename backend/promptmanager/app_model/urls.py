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

from promptmanager.app_model import views

urlpatterns = [
    path("config/get", views.get_model_config, name="getConfig"),
    path("params/parse", views.parse_model_params, name="parseParam"),
    path("save", views.save_model, name="save"),
    path("list", views.get_model_list, name="list"),
    path("update", views.update_model, name="update"),
    path("default", views.default_model, name="default"),
    path("delete", views.delete_model, name="delete"),
    path("name/check", views.check_name, name="checkName")
]
