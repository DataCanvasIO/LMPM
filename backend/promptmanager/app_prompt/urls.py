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

from promptmanager.app_prompt import views

urlpatterns = [
    path("category/add", views.category_add, name="add"),
    path("category/list", views.category_list, name="list"),
    path("category/update", views.category_update, name="update"),
    path("category/delete/validate", views.category_delete_validate, name="deleteValidate"),
    path("category/delete", views.category_delete, name="delete"),
    path("category/move/order", views.category_move_order, name="move"),
    path("category/batch/operate", views.category_batch_operate, name="batch_operate"),
    path("page", views.prompt_page, name="prompt_page"),
    path("add", views.prompt_add, name="prompt_add"),
    path("name/check", views.prompt_name_validate, name="prompt_name_validate"),
    path("update", views.prompt_update, name="prompt_update"),
    path("delete", views.prompt_delete, name="prompt_delete"),
    path("detail", views.prompt_detail, name="prompt_detail"),
    path("variables/parse", views.variables_parse, name="variables_parse"),
    path("scenegroup/list", views.scenegroup_list, name="scenegroup_list"),
    path("list", views.prompt_list, name="prompt_list"),
    path("category/name/check", views.category_name_validate, name="category_name_validate"),
]
