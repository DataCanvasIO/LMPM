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

from promptmanager.testmodule import testmodule

urlpatterns = [
    path("hello", testmodule.hello, name="hello"),
    path("users", testmodule.users, name="users"),
    path("add", testmodule.add, name="add"),
    path("cities", testmodule.cities, name="cities"),
    path("error", testmodule.error, name="error"),

]
