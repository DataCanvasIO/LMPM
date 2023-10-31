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

from promptmanager.app_flow import views

urlpatterns = [
    path("name/check", views.check_flow_name, name="checkName"),
    path("add", views.add_flow, name="add"),
    path("edit", views.edit_flow, name="edit"),
    path("list", views.get_flow_list, name="list"),
    path("copy", views.copy_flow, name="copy"),
    path("delete", views.delete_flow, name="delete"),
    path("publish/status", views.get_flow_publish_status, name="getFlowPublishStatus"),
    path("query", views.query, name="query"),

    path("module/tree", views.get_module_tree, name="getModuleTree"),
    path("node/create", views.create_flow_node, name="createFlowNode"),

    path("pmflow/get", views.get_pm_flow, name="getPMFlow"),
    path("pmflow/save", views.save_pm_flow, name="savePMFlow"),
    path("pmflow/publish", views.publish_pm_flow, name="publishPMFlow"),
    path("pmflow/variables", views.get_pm_flow_variables, name="getPMFLowVariables"),
    path("pmflow/inputNode/check", views.check_input_node, name="checkInputNode"),
    path("pmflow/run", views.run_pm_flow, name="runPMFLow"),
    path("pmflow/run/status", views.get_pm_flow_run_status, name="getPMFlowRunStatus"),

    path("node/script/save", views.save_script_file, name="saveScriptFile"),
    path("node/script/get", views.get_script_content, name="getScriptContent"),

    path("app/delete", views.delete_flow_and_app, name="deleteFlowAndApp"),

]
