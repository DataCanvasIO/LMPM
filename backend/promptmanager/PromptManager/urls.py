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

from django.urls import path, include, re_path
from django.views import static

from promptmanager.PromptManager.settings import base
from promptmanager.PromptManager import view

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('test/', include("testmodule.urls")),
    path('api/chat/', include("app_chat.urls")),
    path('api/flow/', include("app_flow.urls")),
    path('api/model/', include("app_model.urls")),
    path('api/overview/', include("app_overview.urls")),
    path('api/app/', include("app_app.urls")),
    path('api/prompt/', include("app_prompt.urls")),
    path('api/chat/', include("app_chat.urls")),

    re_path(r'^web/(?P<path>.*)$', static.serve, {'document_root': base.STATICFILES_DIRS}),
    re_path(r'^', view.IndexView.as_view(), name="index"),
]
