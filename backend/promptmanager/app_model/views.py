import json
import uuid
import time
import operator
import re
import urllib.parse

from django.forms import model_to_dict
from django.core.paginator import Paginator
from promptmanager.exception import exception

from promptmanager.app_model.models import Model
from promptmanager.PromptManager.settings import base

from promptmanager.app_common.result_maker import ResultMaker
from promptmanager.app_common.database_util import DatabaseUtil
from promptmanager.app_common.json_util import JsonUtil
from promptmanager.app_common.http_request_util import HttpRequestUtil
from promptmanager.app_common.enum_source_type import SourceType
from promptmanager.app_common.constant import Constant

from promptmanager.runtime.common_util import PMCommonUtil

def get_model_config(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    model_id = request.GET.get('id')
    type = request.GET.get('type')# Alaya/OpenAI/Others

    if type == 'Alaya':
        model_config = base.ALAYA_MODEL_CONFIG
    else:
        model_config = base.OPENAI_MODEL_CONFIG

    if model_id:
        try:
            model = Model.objects.get(id=model_id)
        except Exception as e:
            model = None

        if model:
            model_config = model.config

    config = {'config': model_config}
    return ResultMaker.success(config)

def parse_model_params(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    post_params = HttpRequestUtil.get_http_request_body(request)
    type = post_params.get('type')  # Alaya/OpenAI/Others判断
    config = post_params.get('config')
    model_id = post_params.get('id')
    params = post_params.get('params')

    if not operator.contains(config, '${message}'):
        raise exception.MODEL_PARAM_MESSGAE_NOT_EXISTS
    if not operator.contains(config, '${result}'):
        raise exception.MODEL_PARAM_RESULT_NOT_EXISTS

    config_param = re.findall('\${.*?}', config)
    param_result = []
    if type == 'Alaya':
        default_params = json.loads(base.ALAYA_MODEL_PARAMS)
    else:
        default_params = json.loads(base.OPENAI_MODEL_PARAMS)
    if model_id:
        model = Model.objects.filter(id=model_id)[0]
    for param in config_param:
        param_key = param[2: len(param) - 1]
        if operator.contains(param_key, '${'):
            raise exception.MODEL_PARAM_NEST
        elif operator.contains(param_key, '['):
            #去除自定义类型
            param_key = param_key[0: param_key.index('[')]
        elif operator.contains(param_key, ':'):
            #去除自定义默认值
            param_key = param_key[0: param_key.index(':')]

        param_dict = {'name': param_key}

        if model_id:
            for param in json.loads(model.params):
                if param_key == param['name']:
                    param_dict['type'] = param['type']
                    param_dict['defaultValue'] = param['defaultValue']
                    break
        elif params:
            for param in params:
                if param_key == param['name']:
                    param_dict['type'] = param['type']
                    param_dict['defaultValue'] = param['defaultValue']
                    break
        elif type == 'Alaya' or type == 'OpenAI':
            for default_param in default_params:
                if param_key == default_param['name']:
                    param_dict['type'] = default_param['type']
                    param_dict['defaultValue'] = default_param['defaultValue']
                    break

        try:
            param_dict['type']
        except Exception as e:
            param_dict['type'] = None
            param_dict['defaultValue'] = None

        param_result.append(param_dict)

    return ResultMaker.success(param_result)

def save_model(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    post_params = HttpRequestUtil.get_http_request_body(request)

    id = uuid.uuid4()
    name = post_params.get('name')
    description = post_params.get('description')
    config = post_params.get('config')
    type = post_params.get('type')  # Alaya/OpenAI/Others

    enable_stream = False
    if config:
        params = JsonUtil.object_to_json(post_params.get('params'))
        for param in JsonUtil.json_to_dict(params):
            if param['name'] == 'stream':
                if str(param['defaultValue']).lower() == 'true':
                    enable_stream = True
                break
    elif type == 'Alaya':
        config = base.ALAYA_MODEL_CONFIG
        params = base.ALAYA_MODEL_PARAMS
    else:
        config = base.OPENAI_MODEL_CONFIG
        params = base.OPENAI_MODEL_PARAMS
    params_config = get_contains_param_config(config, params)
    try:
        json.loads(params_config)
    except json.JSONDecodeError as e:
        config_list = params_config.split('\n')
        error_msg = e.msg
        error_line = e.lineno
        error_col = e.colno
        lineno = 0
        for line in config_list:
            lineno = lineno + 1
            if error_line == lineno:
                return ResultMaker.fail(6009, 'params fill config json format error: ' + error_msg + ': line ' + str(
                    lineno) + ' column ' + str(error_col) + '. The error pos line is : ' + line)

    model_exist = Model.objects.filter(name=name)
    if model_exist:
        raise exception.MODEL_NAME_REPEAT()

    model_count = DatabaseUtil.query(query_sql='select count(1) from "model"')
    if model_count[0][0] == 0:
        is_default = 1
    else:
        is_default = 0

    model = Model(id=id, name=name, description=description, config=config, params=params, source=SourceType.USER.value, enable_stream=enable_stream, is_default=is_default,
                  user_id=Constant.DEFAULT_USER_ID, create_time=time.time(), update_time=time.time())
    model.save()

    return ResultMaker.success(id)

def get_json_value_path(json, value):
    path = ''
    for p in PMCommonUtil.find_path(json, value, []):
        path = p
    return path

def get_model_list(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    page_num = request.GET.get('pageIndex', 1)
    page_size = request.GET.get('pageNum', 15)
    order_key = request.GET.get('orderKey', 'update_time')
    order_by = request.GET.get('orderBy', 'desc')
    keywords = request.GET.get('keyWords', None)

    if order_by == 'desc':
        order_key = '-' + order_key

    if keywords:
        query_result = Model.objects.filter(name__contains=keywords).order_by(order_key)
        top_result = None
    else:
        top_result = Model.objects.filter(is_default=1)
        query_result = Model.objects.filter(is_default=0).order_by(order_key)

    result = []

    #先放入置顶的默认模型
    if top_result:
        top_model = top_result[0]
        model_dict = model_to_dict(top_model)
        param_config = get_contains_param_config(top_model.config, top_model.params)
        model_dict['params'] = JsonUtil.json_to_dict(top_model.params)
        if JsonUtil.is_json(param_config):
            model_dict['url'] = json.loads(param_config).get('url')
        else:
            model_dict['url'] = None
        model_dict['flow_ref'] = False
        flow_list = DatabaseUtil.query(
            query_sql='select f."name" from flow f, json_each(f."model_ids")m where m."value" = %s',
            params=[model_dict['id']])
        if len(flow_list) > 0:
            model_dict['flow_ref'] = True
        result.append(model_dict)

    #再将其他模型放入
    for model in list(query_result):
        model_dict = model_to_dict(model)
        param_config = get_contains_param_config(model.config, model.params)
        model_dict['params'] = JsonUtil.json_to_dict(model.params)
        if JsonUtil.is_json(param_config):
            model_dict['url'] = json.loads(param_config).get('url')
        else:
            model_dict['url'] = None
        model_dict['flow_ref'] = False
        flow_list = DatabaseUtil.query(
            query_sql='select f."name" from flow f, json_each(f."model_ids")m where m."value" = %s',
            params=[model_dict['id']])
        if len(flow_list) > 0:
            model_dict['flow_ref'] = True
        result.append(model_dict)

    p = Paginator(result, page_size)
    page_data = p.page(page_num)

    page_result = {
        'count': len(result),
        'rows': list(page_data)
    }

    return ResultMaker.success(page_result)

def update_model(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    post_params = HttpRequestUtil.get_http_request_body(request)

    model_id = post_params.get('id')
    name = post_params.get('name')
    description = post_params.get('description')

    enable_stream = False
    try:
        config = post_params.get('config')
        params = JsonUtil.object_to_json(post_params.get('params'))
        for param in JsonUtil.json_to_dict(params):
            if param['name'] == 'stream':
                if str(param['defaultValue']).lower() == 'true':
                    enable_stream = True
                break
    except Exception as e:
        config = base.MODEL_DEFAULT_CONFIG
        params = base.MODEL_DEFAULT_PARAMS
    params_config = get_contains_param_config(config, params)
    try:
        json.loads(params_config)
    except ValueError as err:
        return ResultMaker.fail(6009, 'params fill config json format error: ' + err.args[0])

    model_count = DatabaseUtil.query(query_sql='select count(1) from "model" where name = %s and id != %s',
                                     params=[name, model_id])
    if model_count[0][0] > 0:
        raise exception.MODEL_NAME_REPEAT()

    Model.objects.filter(id=model_id).update(name=name, description=description, config=config, params=params, enable_stream=enable_stream, update_time=time.time())

    return ResultMaker.success(model_id)

def default_model(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    model_id = params.get('id')

    #先将原有默认模型置为false
    default_model_id = DatabaseUtil.query(query_sql='select id from model where is_default=1')
    if default_model_id:
        Model.objects.filter(id=default_model_id[0][0]).update(is_default=0)

    #再将新的默认模型置为true
    Model.objects.filter(id=model_id).update(is_default=1)

    return ResultMaker.success(model_id)

def delete_model(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    model_id = params.get('id')
    try:
        model = Model.objects.get(id=model_id)
    except Exception as e:
        raise exception.MODEL_NOT_EXISTS

    if model.is_default:
        raise exception.DEFAULT_MODEL_CANNOT_DELETE()

    flow_name_list = DatabaseUtil.query(query_sql='select f."name" from flow f, json_each(f."model_ids")m where m."value" = %s',
                       params=[model_id])
    if len(flow_name_list) > 0:
        flow_names = ''
        for flow_name in flow_name_list:
            flow_names = flow_names + '\"' + flow_name[0] + '\",'
        flow_names = flow_names[0:len(flow_names) - 1]
        message = 'The model is already referenced by ' + flow_names + '，it cannot be deleted'
        return ResultMaker.fail(6008, message)

    Model.objects.filter(id=model_id).delete()

    return ResultMaker.success(model_id)

def get_contains_param_config(config, params):
    for param in JsonUtil.json_to_dict(params):
        param_name = '${' + param['name'] + '}'
        default_value = str(param['defaultValue'])
        if operator.contains(str(param['type']).lower(), 'json'):
            default_value = JsonUtil.object_to_json(param['defaultValue'])
        config = config.replace(param_name, default_value)
    config = config.replace('True', 'true')
    config = config.replace('False', 'false')
    config = config.replace('None', 'null')
    return config


def generate_template_model_param(model_id=None):
    try:
        if model_id:
            model = Model.objects.get(id=model_id)
        else:
            model = Model.objects.get(is_default=1)
    except Exception:
        raise exception.DEFAULT_MODEL_NOT_EXIST

    model_params_value = [
        {
            "name": "modelId",
            "type": "",
            "options": [],
            "defaultValue": "",
            "value": model.id
        }
    ]

    model_dict = {}
    if model.params:
        params = JsonUtil.json_to_dict(model.params)
        model_params_value.extend(params)

        model_dict["params_define"] = params

    if model.config:
        model_dict["config"] = model.config

    return model_dict,model_params_value

def check_name(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    model_name = params.get('name')
    if model_name:
        model_name = urllib.parse.unquote(model_name)
    model_id = params.get('id')

    exist_count = 0
    if model_id:
        exist_obj = DatabaseUtil.query(query_sql='select count(*) from model where "id" != %s and "name" = %s',
                                         params=[model_id, model_name])
        exist_count = exist_obj[0][0]
    else:
        exist_obj = DatabaseUtil.query(query_sql='select count(*) from model where "name" = %s',
                                       params=[model_name])
        exist_count = exist_obj[0][0]

    is_exist = False
    if exist_count > 0:
        is_exist = True

    return ResultMaker.success(is_exist)
