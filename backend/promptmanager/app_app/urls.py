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

from promptmanager.app_app import views

urlpatterns = [
    path("list", views.get_app_list, name="list"),
    path("delete", views.delete_app, name="delete"),
    path("update", views.update_app, name="update"),
    path("name/check", views.check_name, name="checkName"),
    path("sdk/demo/get", views.get_sdk_demo, name="getSdkDemo"),
    path("sdk/export", views.export_sdk, name="exportSdk"),
    path("from/flow/publish", views.publish_from_flow, name="publishFlow"),
    path("<str:id>/run", views.run_app, name="runApp"),
    path("<str:id>/upload", views.upload_file, name="uploadFile"),
]
