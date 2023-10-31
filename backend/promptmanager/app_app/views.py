import json
import time
import uuid
import os
import shutil
import urllib.parse
import platform

from django.forms import model_to_dict
from django.core.paginator import Paginator
from django.http import FileResponse, StreamingHttpResponse, Http404
from pathlib import Path
from datetime import datetime

from promptmanager.app_common.constant import Constant
from promptmanager.app_common.enum_source_type import SourceType
from promptmanager.exception import exception

from promptmanager.app_app.models import App
from promptmanager.app_flow.models import Flow
from promptmanager.app_flow import views as flow_service

from promptmanager.PromptManager.settings import base
from promptmanager.app_common.result_maker import ResultMaker
from promptmanager.app_common.json_util import JsonUtil
from promptmanager.app_common.http_request_util import HttpRequestUtil
from promptmanager.app_common.database_util import DatabaseUtil
from promptmanager.app_common.file_util import FileUtil

from promptmanager.runtime.common_util import PathUtil, PMCommonUtil


def get_app_list(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    page_num = request.GET.get('pageIndex', 1)
    page_size = request.GET.get('pageNum', 15)
    order_key = request.GET.get('orderKey', 'update_time')
    order_by = request.GET.get('orderBy', 'desc')
    keywords = request.GET.get('keyWords', None)

    # "输入变量数"默认升序
    input_variables_order_by = False

    if order_key == 'input_variables':
        if order_by == 'desc':
            input_variables_order_by = True
        if keywords:
            query_result = App.objects.filter(name__contains=keywords)
        else:
            query_result = App.objects.all()
    else:
        if order_by == 'desc':
            order_key = '-' + order_key
        if keywords:
            query_result = App.objects.filter(name__contains=keywords).order_by(order_key)
        else:
            query_result = App.objects.all().order_by(order_key)

    runserver_url = os.getenv('RUNSERVER_URL')
    if runserver_url:
        app_url_properties = runserver_url + '/api/app/<appId>/run'
    else:
        app_url_properties = base.APP_URL
    result = []
    for app in list(query_result):
        app_dict = model_to_dict(app)
        # 设置app的url
        app_dict['url'] = app_url_properties.replace('<appId>', app.id)
        # 设置flow名称
        try:
            flow = Flow.objects.get(id=app.flow_id)
            flow_name = flow.name
            flow_description = flow.description
        except Exception as e:
            flow_name = None
            flow_description = None
        app_dict['flow_name'] = flow_name
        app_dict['flow_description'] = flow_description
        # 设置输入变量
        if JsonUtil.is_json(app.input_info):
            app_dict['input_variables'] = len(json.loads(app.input_info))
        else:
            app_dict['input_variables'] = 0
        try:
            app_dict['input_info'] = json.loads(app_dict['input_info'])
        except Exception as e:
            app_dict['input_info'] = app_dict['input_info']
        # 设置flow运行状态
        app_dict['flow_status'] = flow_service.query_flow_run_status(app.flow_id)
        result.append(app_dict)

    if order_key == 'input_variables':
        result.sort(key=lambda x: x['input_variables'], reverse=input_variables_order_by)

    p = Paginator(result, page_size)
    page_data = p.page(page_num)

    page_result = {
        'count': len(result),
        'rows': list(page_data)
    }

    return ResultMaker.success(page_result)


def delete_app(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    app_id = params.get('id')
    try:
        app = App.objects.get(id=app_id)
    except Exception as e:
        raise exception.APP_NOT_EXISTS
    app.delete()

    return ResultMaker.success(app_id)


def check_name(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    app_name = request.GET.get('name', None)
    if app_name:
        app_name = urllib.parse.unquote(app_name)

    result = _check_name(app_name=app_name)
    return ResultMaker.success(result)


def _check_name(app_name):
    exist_obj = DatabaseUtil.query(query_sql='select count(*) from "app" where name = %s', params=[app_name])

    is_exist = False
    if exist_obj[0][0] > 0:
        is_exist = True

    result = {"exists": is_exist}
    return result


def update_app(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    app_id = params.get('id')
    app_name = params.get('name')
    try:
        app = App.objects.get(id=app_id)
    except Exception as e:
        raise exception.APP_NOT_EXISTS
    App.objects.filter(id=app_id).update(name=app_name)

    return ResultMaker.success(app_id)


def get_sdk_demo(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    app_id = request.GET.get('id')

    try:
        app = App.objects.get(id=app_id)
    except Exception as e:
        raise exception.APP_NOT_EXISTS

    try:
        flow = Flow.objects.get(id=app.flow_id)
    except Exception as e:
        raise exception.FLOW_NOT_FOUND

    runserver_url = os.getenv('RUNSERVER_URL')
    if runserver_url:
        app_url = runserver_url + '/api/app/<appId>/run'
    else:
        app_url = base.APP_URL
        runserver_url = app_url.replace('/api/app/<appId>/run', '')

    app_url = app_url.replace('<appId>', app.id)

    sdk_py_path = Path(__file__).resolve().parent / 'sdk_example.py'
    wirte_sdk_demo(app, flow, True, sdk_py_path, runserver_url, app_url)

    sdk_md_path = Path(__file__).resolve().parent / 'sdk_example.md'
    wirte_sdk_demo(app, flow, False, sdk_md_path, runserver_url, app_url)
    return FileResponse(open(sdk_md_path, 'rb'))


def wirte_sdk_demo(app, flow, is_py, sdk_path, runserver_url, app_url):
    file = open(sdk_path, 'w')
    if not is_py:
        file.write('```python\n')
    file.write('from pathlib import Path\n\n')
    file.write('from promptmanager.runtime.app import PMApp\n')
    file.write('from promptmanager.runtime.flow import PMFlow\n\n')

    file.write('# example1\n')
    file.write('pmFlow = PMFlow.load(Path(__file__).resolve().parent / "flow/' + app.flow_id + '/text_pm.pmflow");\n')
    file.write('pmApp = PMApp.publish_from_flow(pmFlow, "' + runserver_url + '", name="test")\n')
    variables = json.loads(flow.params)
    for variable in variables:
        if 'value' not in variable:
            variable['value'] = variable['defaultValue']
    variables = JsonUtil.object_to_json(variables)
    file.write('variables = ' + variables + '\n')
    file.write('pmApp.run_by_pm_flow(variables=variables)\n')
    file.write('pmApp.show_result()\n\n')

    file.write('# example2\n')
    file.write('variables = ' + variables + '\n')
    file.write('url = "' + app_url + '"\n')
    file.write('PMApp.run_by_app_url(url, variables)\n')

    if not is_py:
        file.write('```')

    file.close()


def export_sdk(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    app_id = params.get('id')

    try:
        app = App.objects.get(id=app_id)
    except Exception as e:
        raise exception.APP_NOT_EXISTS

    app_path = Path(__file__).resolve().parent
    promptmanager_path = Path(__file__).resolve().parent.parent
    system = platform.system()
    if system == 'Windows':
        sdk_name = 'tmp\\' + app.name + '_sdk'
    else:
        sdk_name = 'tmp/' + app.name + '_sdk'
    sdk_tmp_path = promptmanager_path / sdk_name
    if os.path.exists(sdk_tmp_path):
        shutil.rmtree(sdk_tmp_path)
    os.makedirs(sdk_tmp_path)

    sdk_tmp_promptmanager_path = sdk_tmp_path / 'promptmanager'
    if os.path.exists(sdk_tmp_promptmanager_path):
        shutil.rmtree(sdk_tmp_promptmanager_path)
    os.makedirs(sdk_tmp_promptmanager_path)
    shutil.copy(app_path / 'sdk_example.py', sdk_tmp_promptmanager_path)

    flow_id = app.flow_id
    flow_original_path = PathUtil.get_flow_base_path() / flow_id
    sdk_tmp_flow_path = sdk_tmp_promptmanager_path / 'flow' / flow_id
    if os.path.exists(sdk_tmp_flow_path):
        shutil.rmtree(sdk_tmp_flow_path)
    os.makedirs(sdk_tmp_flow_path)

    sdk_tmp_path_str = str(sdk_tmp_path)
    sdk_tmp_promptmanager_path_str = str(sdk_tmp_promptmanager_path)
    src_dir_path = str(flow_original_path)
    FileUtil.copy_folder(src_dir_path, FileUtil.make_parent_dir(src_dir_path, str(sdk_tmp_promptmanager_path / 'flow')))
    flow_running_info_path = sdk_tmp_flow_path / 'flow_running.info'
    if os.path.exists(flow_running_info_path):
        os.remove(flow_running_info_path)

    # generate text_pm.pmflow
    flow = Flow.objects.get(id=flow_id)
    flow_data = PMCommonUtil.object_to_json(flow)
    sdk_tmp_flow_text_path = sdk_tmp_flow_path / 'text_pm.pmflow'
    open(sdk_tmp_flow_text_path, 'a').close()
    FileUtil.generate_file(flow_data, sdk_tmp_flow_text_path)

    src_dir_path = str(promptmanager_path / 'model')
    FileUtil.copy_folder(src_dir_path, FileUtil.make_parent_dir(src_dir_path, sdk_tmp_promptmanager_path_str))
    src_dir_path = str(promptmanager_path / 'runtime')
    FileUtil.copy_folder(src_dir_path, FileUtil.make_parent_dir(src_dir_path, sdk_tmp_promptmanager_path_str))
    src_dir_path = str(promptmanager_path / 'script')
    FileUtil.copy_folder(src_dir_path, FileUtil.make_parent_dir(src_dir_path, sdk_tmp_promptmanager_path_str))
    src_dir_path = str(promptmanager_path / 'exception')
    FileUtil.copy_folder(src_dir_path, FileUtil.make_parent_dir(src_dir_path, sdk_tmp_promptmanager_path_str))
    src_dir_path = str(promptmanager_path / 'PromptManager')
    FileUtil.copy_folder(src_dir_path, FileUtil.make_parent_dir(src_dir_path, sdk_tmp_promptmanager_path_str))

    shutil.copy(promptmanager_path / 'requirements.txt', sdk_tmp_promptmanager_path)
    # shutil.copy(promptmanager_path.parent / 'setup.py', sdk_tmp_promptmanager_path)
    sdk_zip_path = sdk_tmp_path_str + '.zip'
    FileUtil.zip_folder(sdk_tmp_path_str, sdk_zip_path)

    try:
        response = StreamingHttpResponse(open(sdk_zip_path, 'rb'))
        response['content_type'] = "application/force-download"
        response['Content-Disposition'] = 'attachment; filename=' + os.path.basename(sdk_zip_path)
        return response
    except Exception:
        raise Http404


def publish_from_flow(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    pm_flow = JsonUtil.json_to_dict(params.get('pm_flow'))
    name = params.get('name', None)

    # save flow
    if name:
        pm_flow['name'] = name
    flow_service.add_flow_from_PMFlow(pm_flow)

    # save app
    flow_params = {'app_name': name if name is not None else pm_flow['name'], 'flow_id': pm_flow['id'],
                   'input_info': JsonUtil.object_to_json(pm_flow['params'])}
    app_id = add(flow_params)
    return ResultMaker.success(app_id)


def run_app(request, id):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    app_id = id
    variables = params.get('variables')

    try:
        app = App.objects.get(id=app_id)
    except Exception as e:
        raise exception.APP_NOT_EXISTS

    result = flow_service.sync_do_run_pm_flow(app.flow_id, variables)
    return ResultMaker.success(result)


def upload_file(request, id):
    if request.method != "POST":
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    file = request.FILES.get('file', None)

    if file is None:
        raise exception.UPLOAD_FILE_CANNOT_BE_EMPTY()
    else:
        file_name = file.name
        if not allowed_file(file_name):
            raise exception.UPLOAD_FILE_TYPE_NOT_BE_ALLOWED()
        dir_root_path = base.APP_FILE_UPLOAD_ROOT_PATH
        file_root_Path = dir_root_path + '/' + str(datetime.now().strftime('%Y-%m-%d')) + '/' + id
        if not os.path.exists(file_root_Path):
            os.makedirs(file_root_Path)
        file_path = os.path.join(file_root_Path, file_name)
        with open(file_path, 'wb+') as f:
            for chunk in file.chunks():
                f.write(chunk)
        result = {
            'uploadFilePath': file_path
        }
        return ResultMaker.success(result)


def allowed_file(filename):
    ALLOWED_EXTENSIONS = base.ALLOWED_EXTENSIONS
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def add(params):
    id = uuid.uuid4()
    app_name = params['app_name']
    check_result = _check_name(app_name=app_name)
    if check_result['exists']:
        raise exception.APP_NAME_REPEAT

    description = app_name
    flow_id = params['flow_id']
    input_info = params['input_info']

    app = App(id=id, name=app_name, description=description, flow_id=flow_id, input_info=input_info,
              source=SourceType.USER.value, create_time=time.time(), update_time=time.time(),
              user_id=Constant.DEFAULT_USER_ID)

    app.save()
    return id


def update(params):
    id = params['app_id']
    flow_id = params['flow_id']
    input_info = params['input_info']

    App.objects.filter(id=id).update(flow_id=flow_id,
                                     input_info=input_info,
                                     update_time=time.time())

    return id
