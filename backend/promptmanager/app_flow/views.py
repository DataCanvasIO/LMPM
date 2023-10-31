import logging
import os
import shutil
import time
import urllib.parse
import uuid


from django.db.models import Q

from promptmanager.app_common.enum_module_path import ModulePath
from promptmanager.app_flow.models import Flow, Module
from promptmanager.app_app.models import App
from promptmanager.app_prompt.models import Prompt
from promptmanager.app_common.constant import Constant
from promptmanager.app_common.database_util import DatabaseUtil
from promptmanager.app_common.enum_publish_type import PublishType
from promptmanager.app_common.http_request_util import HttpRequestUtil
from promptmanager.app_common.json_util import JsonUtil
from promptmanager.app_common.page_util import PageUtil, PageParam, PageInfo
from promptmanager.app_common.result_maker import ResultMaker
from promptmanager.app_common.enum_source_type import SourceType
from promptmanager.exception import exception
from promptmanager.app_app import views as app_service
from promptmanager.runtime.common_util import PMCommonUtil, FileUtil, PathUtil
from promptmanager.runtime.enumeration.enum_flow_status import PMFlowStatus
from promptmanager.runtime.flow import PMFlow, PMFlowEdge, PMFlowTemplateNode, PMFlowScriptNode
from promptmanager.runtime.template import PMPromptTemplate
from promptmanager.app_prompt import views as prompt_service
from promptmanager.app_model import views as model_service

logger = logging.getLogger('pm_log')


# Create your views here.
def check_flow_name(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    name = request.GET.get('name')
    if name:
        name = urllib.parse.unquote(name)

    exists = __check_name_exists(name)

    result = {
        "exists": exists
    }

    return ResultMaker.success(result)


def __check_name_exists(name):
    try:
        flow = Flow.objects.get(name=name)
    except Exception as e:
        flow = None

    if flow:
        exists = True
    else:
        exists = False
    return exists


def add_flow(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    id = uuid.uuid4()
    name = params.get('name')
    description = params.get('description', '')

    exists = __check_name_exists(name)
    if exists:
        raise exception.FLOW_NAME_EXISTS

    # 封装pm_flow
    pm_flow = PMFlow()
    flow_json = {
        "nodes": JsonUtil.object_to_dict(pm_flow.nodes),
        "edges": JsonUtil.object_to_dict(pm_flow.edges)
    }

    flow = Flow(id=id, name=name, description=description, config=JsonUtil.object_to_json(flow_json), model_ids='[]',
                source=SourceType.USER.value, create_time=time.time(), update_time=time.time(),
                user_id=Constant.DEFAULT_USER_ID)

    flow.save()
    return ResultMaker.success(id)


def edit_flow(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    id = params.get('id')

    publish_status = query_flow_publish_status(flow_id=id)
    if publish_status['published'] == 1:
        raise exception.FLOW_IS_PUBLISHED

    name = params.get('name')
    description = params.get('description', '')

    count_result = DatabaseUtil.query('select count(*) as count from flow where name = %s and id != %s', [name, id],
                                      return_dict=True)
    count = count_result[0]['count']
    if count > 0:
        raise exception.FLOW_NAME_EXISTS

    Flow.objects.filter(id=id).update(name=name, description=description, update_time=time.time())
    return ResultMaker.success(id)


def get_flow_list(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()
    # page
    page_index = request.GET.get('pageIndex', 1)
    page_num = request.GET.get('pageNum', 15)
    # order
    order_key = request.GET.get('orderKey')
    if not order_key:
        order_key = "update_time"

    order_by = request.GET.get('orderBy')
    if not order_by:
        order_by = 'desc'
    # keywords
    keywords = request.GET.get('keyWords', None)

    page_param = PageParam(page_index=int(page_index), page_num=int(page_num))
    offset, limit = page_param.get_offset_and_limit()

    query_list_sql = (
        'select f."id",f."name",f."description",f."prompt_count",f."create_time",f."update_time",a."id" as "app_id",a."name" as "app_name",'
        'case when a."id" is null then false else true end as "published" '
        'from flow f left join app a on f.id = a."flow_id" ')

    query_count_sql = 'select count(*) as count from flow f left join app a on f.id = a."flow_id" '

    query_list_param = [offset, limit]
    query_count_param = []
    if keywords:
        query_list_sql += 'where f."name" like %s '
        query_list_param.insert(0, '%' + keywords + '%')

        query_count_sql += 'where f."name" like %s '
        query_count_param.insert(0, '%' + keywords + '%')

    if order_by == 'desc':
        query_list_sql += (' order by f."{}" desc limit %s,%s').format(order_key)
    else:
        query_list_sql += (' order by f."{}" asc limit %s,%s').format(order_key)

    list_result = DatabaseUtil.query(query_sql=query_list_sql, params=query_list_param, return_dict=True)
    count_result = DatabaseUtil.query(query_sql=query_count_sql, params=query_count_param, return_dict=True)

    page_info = PageInfo(rows=list_result, count=count_result[0]['count'])
    return ResultMaker.success(JsonUtil.object_to_dict(page_info))


def copy_flow(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)
    source_id = params.get('source_id')
    target_id = uuid.uuid4()
    target_name = params.get('target_name')
    # target_description = params.get('target_description', '')

    exists = __check_name_exists(target_name)
    if exists:
        raise exception.FLOW_NAME_EXISTS

    try:
        flow = Flow.objects.get(id=source_id)
    except Exception as e:
        raise exception.FLOW_NOT_FOUND()

    flow.id = target_id
    flow.name = target_name
    # if target_description:
    #     flow.description = target_description
    flow.create_time = time.time()
    flow.update_time = time.time()

    #  replace nodes and edges id
    if flow.config:
        flow.config = __replace_nodes_edges_id(JsonUtil.json_to_dict(flow.config), source_id, target_id)

    flow.save()

    return ResultMaker.success(target_id)


def __replace_nodes_edges_id(config, source_id, target_id):
    nodes = config['nodes']
    edges = config['edges']
    node_id_dict = {}
    for node in nodes:
        old_node_id = node['id']
        new_node_id = str(uuid.uuid4())

        node_id_dict[old_node_id] = new_node_id
        node['id'] = new_node_id

        # copy script main.py
        if node['module_type'] in ['script', 'vectordb', 'script_prompt', 'loader', 'agent', 'embedding']:
            source_script_absolute_path = __get_script_absolute_path(flow_id=source_id, node_id=old_node_id)
            target_db_save_path, target_script_absolute_path, target_script_parent_absolute_path = __get_script_all_paths(
                flow_id=target_id, node_id=new_node_id)
            # if source script exists
            if os.path.exists(source_script_absolute_path):
                # if target script parent path not exists
                if not os.path.exists(target_script_parent_absolute_path):
                    # mkdir target script parent path
                    os.makedirs(target_script_parent_absolute_path)
                # copy source script to target script
                shutil.copy2(source_script_absolute_path, target_script_absolute_path)
                # update node script path
                for script_param in node['params']['script']:
                    if script_param['name'] == 'script':
                        script_param['value'] = target_db_save_path
                        break

    for edge in edges:
        flow_edge = PMFlowEdge.load_by_edge(edge)
        edge['source_node'] = node_id_dict[flow_edge.source_node]
        edge['target_node'] = node_id_dict[flow_edge.target_node]

    new_config = {
        "nodes": nodes,
        "edges": edges
    }

    return JsonUtil.object_to_json(new_config)


def delete_flow(request):
    if request.method != 'DELETE':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)
    id = params.get('id')

    # delete flow folder
    flow_path = PathUtil.get_flow_base_path() / id
    if os.path.exists(flow_path):
        shutil.rmtree(flow_path)

    Flow.objects.filter(id=id).delete()

    return ResultMaker.success(id)


def get_flow_publish_status(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()
    # page
    flow_id = request.GET.get('flow_id')
    result = query_flow_publish_status(flow_id=flow_id)
    return ResultMaker.success(result)


def query(request):
    flow_id = request.GET.get('flow_id')
    flow = Flow.objects.get(id=flow_id)
    return ResultMaker.success(PMCommonUtil.object_to_dict(flow))


def query_flow_publish_status(flow_id):
    query_result = DatabaseUtil.query(query_sql='select id from app where flow_id = %s', params=[flow_id],
                                      return_dict=True)
    published = 0
    if query_result:
        published = 1

    result = {
        "published": published
    }
    return result


def get_module_tree(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    prompt_result_list = []
    prompt_count = 0

    keywords = request.GET.get('keyWords')
    prompt_scene_sql = 'select id,name from class where "type" = \'scene\''
    scene_list = DatabaseUtil.query(query_sql=prompt_scene_sql, return_dict=True)

    for scene in scene_list:
        scene_id = scene['id']
        # query prompt by scene_id
        prompt_list = __query_prompt(scene_id, keywords)
        scene = {
            "id": scene_id,
            "name": scene['name'],
            "type": "scene",
            "child_count": prompt_list.__len__(),
            "childs": prompt_list
        }
        prompt_count += prompt_list.__len__()
        prompt_result_list.append(scene)

    query_define_prompt_sql = 'select "id","name","type" as "type",null as "prompt",null as "role_id",null as "role_name" from "module" where (type = %s or type = %s)'

    query_define_prompt_param = ['prompt', 'script_prompt']
    if keywords:
        query_define_prompt_sql += ' and "name" like %s'
        query_define_prompt_param.append('%' + keywords + '%')
    define_prompts = DatabaseUtil.query(query_define_prompt_sql, query_define_prompt_param, True)
    prompt_count += define_prompts.__len__()

    define_prompt_scene = {
        "id": Constant.DEFINE_PROMPT_SCENE_ID,
        "name": 'Define Prompt',
        "type": "scene",
        "child_count": define_prompts.__len__(),
        "childs": define_prompts
    }
    prompt_result_list.append(define_prompt_scene)

    if keywords:
        tools = Module.objects.filter(Q(group='tool') & Q(name__contains=keywords))
        scripts = Module.objects.filter(Q(group='vectordb') & Q(name__contains=keywords))
        agents = Module.objects.filter(Q(group='agent') & Q(name__contains=keywords))
        loaders = Module.objects.filter(Q(group='loader') & Q(name__contains=keywords))
        embeddings = Module.objects.filter(Q(group='embedding') & Q(name__contains=keywords))
        # chains = Module.objects.filter(Q(group='chains') & Q(name__contains=keywords))
    else:
        tools = Module.objects.filter(group='tool')
        scripts = Module.objects.filter(group='vectordb')
        agents = Module.objects.filter(group='agent')
        loaders = Module.objects.filter(group='loader')
        embeddings = Module.objects.filter(group='embedding')
        # chains = Module.objects.filter(group='chains')

    result = [
        {
            "id": Constant.PROMPT_SCENE_ID,
            "name": "Prompt",
            "child_count": prompt_count,
            "childs": prompt_result_list
        },
        {
            "id": Constant.SCRIPT_SCENE_ID,
            "name": "Tool",
            "child_count": tools.count(),
            "childs": list(tools.values())
        },
        {
            "id": Constant.VECTORDB_SCENE_ID,
            "name": "Vector Database",
            "child_count": scripts.count(),
            "childs": list(scripts.values())
        },
        # {
        #     "id": Constant.AGENT_SCENE_ID,
        #     "name": "Agent",
        #     "child_count": agents.count(),
        #     "childs": list(agents.values())
        # },
        {
            "id": Constant.LOADER_SCENE_ID,
            "name": "Loader",
            "child_count": loaders.count(),
            "childs": list(loaders.values())
        },
        {
            "id": Constant.EMBEDDING_SCENE_ID,
            "name": "Embedding",
            "child_count": embeddings.count(),
            "childs": list(embeddings.values())
        }
    ]

    return ResultMaker.success(result)


# query prompt by scene_id
def __query_prompt(scene_id, keywords):
    query_param = [scene_id]
    query_prompt_sql = 'select pt."id",pt."name",\'prompt\' as "type",pt."prompt",pt."role_id",c."name" as "role_name" from "prompt" pt left join class c on pt."role_id" = c."id" where pt."scene_id" = %s'
    if keywords:
        query_prompt_sql += ' and pt."name" like %s'
        query_param.append('%' + keywords + '%')
    return DatabaseUtil.query(query_prompt_sql, query_param, True)


def __create_define_prompt_node(id):
    module = Module.objects.get(id=id)
    # get model
    model_dict, model_params_value = model_service.generate_template_model_param()
    template = PMPromptTemplate(template_content="")
    node = PMFlowTemplateNode(template=template, model=model_dict, model_params_value=model_params_value)
    node.module_id = module.id
    node.module_name = module.name
    return node


def __create_prompt_node(id):
    # get template
    prompt = Prompt.objects.get(id=id)
    role_name, role_template = prompt_service.generate_template_role_info(role_id=prompt.role_id)
    template = PMPromptTemplate(role=role_name, template_content=prompt.prompt, role_prompt=role_template)
    # get model
    model_dict, model_params_value = model_service.generate_template_model_param()
    # generate node
    node = PMFlowTemplateNode.from_template(template=template, model=model_dict,
                                            model_params_value=model_params_value)
    # package other info
    role_id_dict = {
        "name": "roleId",
        "type": "text",
        "defaultValue": prompt.role_id,
        "value": prompt.role_id
    }
    node.params['role'].insert(0, role_id_dict)
    node.module_id = prompt.id
    node.module_name = prompt.name
    return node


def __create_script_prompt_node(id):
    script_prompt_module = Module.objects.get(id=id)
    role_id = Constant.NONE_PROMPT_ROLE_ID
    role_name, role_template = prompt_service.generate_template_role_info(role_id=role_id)
    template = PMPromptTemplate(role=role_name, template_content="", role_prompt=role_template)
    # get model
    model_dict, model_params_value = model_service.generate_template_model_param()
    # generate node
    node = PMFlowTemplateNode.from_template(template=template, model=model_dict,
                                            model_params_value=model_params_value)
    role_id_dict = {
        "name": "roleId",
        "type": "text",
        "defaultValue": Constant.NONE_PROMPT_ROLE_ID,
        "value": Constant.NONE_PROMPT_ROLE_ID
    }
    node.params['script'] = JsonUtil.json_to_dict(script_prompt_module.params)
    node.params['role'].insert(0, role_id_dict)
    node.module_id = id
    node.module_name = script_prompt_module.name
    node.module_type = 'script_prompt'
    return node


def __create_script_node(id):
    script_module = Module.objects.get(id=id)
    node = PMFlowScriptNode(module_id=script_module.id,
                            module_name=script_module.name,
                            module_type=script_module.type,
                            description=script_module.description,
                            params=JsonUtil.json_to_dict(script_module.params),
                            inputs=JsonUtil.json_to_dict(script_module.inputs),
                            outputs=JsonUtil.json_to_dict(script_module.outputs))
    return node


def create_flow_node(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    id = params['id']
    type = params['type']

    if id == Constant.DEFAULT_DEFINE_PROMPT_ID:
        node = __create_define_prompt_node(id)
    elif type == 'prompt':
        node = __create_prompt_node(id)
    elif type == 'script_prompt':
        node = __create_script_prompt_node(id)
    elif type in ['script', 'vectordb', 'loader','agent','embedding']:
        node = __create_script_node(id)
    else:
        raise exception.FLOW_MODULE_TYPE_NOT_SUPPORT

    node.id = None
    node.name = None
    return ResultMaker.success(JsonUtil.object_to_dict(node))


def get_pm_flow(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    try:
        flow = Flow.objects.get(id=request.GET.get('id'))
    except Exception as e:
        raise exception.FLOW_NOT_FOUND
    # json to dict
    if flow.config:
        flow.config = JsonUtil.json_to_dict(flow.config)
        nodes = flow.config['nodes']
        load_new_model(nodes)
    if flow.params:
        flow.params = JsonUtil.json_to_dict(flow.params)
    if flow.model_ids:
        flow.model_ids = JsonUtil.json_to_dict(flow.model_ids)

    return ResultMaker.success(JsonUtil.object_to_dict(flow))


def load_new_model(nodes: list):
    for node in nodes:
        if node['module_type'] == 'prompt':
            model_user_setting = {}
            model_params = node['params']['model']
            model_id = None
            for param in model_params:
                if param['name'] == "modelId":
                    model_id = param['value']
                if param['name'] not in (
                        'modelId', 'model_config', 'model_param_define') and not PMCommonUtil.is_value_none(
                    'value', param):
                    model_user_setting[param['name']] = param['value']

            model_dict, model_params_value = model_service.generate_template_model_param(model_id)
            # add model_dict into model_param
            model_config = {
                "name": "model_config",
                "type": "text",
                "value": model_dict['config']

            }
            model_define_dict = PMCommonUtil.object_to_dict(model_dict['params_define'])
            model_param_define = {
                "name": "model_param_define",
                "type": "dict",
                "value": model_define_dict
            }
            model_params_value.append(model_config)
            model_params_value.append(model_param_define)

            for new_model_param in model_params_value:
                if not PMCommonUtil.is_value_none(new_model_param['name'], model_user_setting):
                    new_model_param['value'] = model_user_setting[new_model_param['name']]
                if new_model_param['name'] == 'stream':
                    new_model_param['value'] = "False"

            node['params']['model'] = model_params_value


def save_pm_flow(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)
    flow_id = params['id']

    publish_status = query_flow_publish_status(flow_id=flow_id)
    if publish_status['published'] == 1:
        raise exception.FLOW_IS_PUBLISHED

    # calculate prompt count and model_ids
    prompt_count, model_ids = __calculate_and_handle_nodes(flow_id, params['nodes'])
    config = {
        "nodes": params['nodes'],
        "edges": params['edges']
    }

    # get input variables
    input_variables = PMFlow.get_flow_input_params(params['nodes'], params['edges'])

    # query flow and update flow
    Flow.objects.filter(id=params['id']).update(prompt_count=prompt_count, model_ids=JsonUtil.object_to_json(model_ids),
                                                params=JsonUtil.object_to_json(input_variables),
                                                config=JsonUtil.object_to_json(config), update_time=time.time())

    return ResultMaker.success(params['id'])


def __calculate_and_handle_nodes(flow_id, nodes):
    prompt_count = 0
    module_ids = []
    for node in nodes:
        if node['module_type'] in ['prompt', 'script_prompt']:
            prompt_count += 1
            if 'model' not in node['params']:
                continue
            model_params = node['params']['model']
            for model_param in model_params:
                if model_param['name'] == 'modelId':
                    model_id = model_param['value']
                    module_ids.append(model_id)
                    break
            model_params = add_model_params(model_params)
            node['params']['model'] = model_params

        if node['module_type'] in ['script', 'vectordb', 'script_prompt', 'loader', 'agent', 'embedding']:
            db_save_path, script_absolute_path, script_parent_absolute_path = __get_script_all_paths(flow_id=flow_id,
                                                                                                     node_id=node['id'])
            if not os.path.exists(script_absolute_path):
                # copy file to node path
                module_id = node['module_id']
                source_script_path = ModulePath.get_module_path_by_id(module_id=module_id)

                if not os.path.exists(script_parent_absolute_path):
                    os.makedirs(script_parent_absolute_path)
                shutil.copy2(source_script_path, script_absolute_path)

            for script_param in node['params']['script']:
                if script_param['name'] == 'script':
                    script_param['value'] = db_save_path
                    script_param['path_type'] = "relative"
                    break

    return prompt_count, module_ids


def add_model_params(model_params):
    model_id = None
    exists_model_define = False
    exists_model_config = False
    for model_param in model_params:
        if model_param['name'] == 'modelId':
            model_id = model_param['value']
        elif model_param['name'] == 'stream':
            model_param['value'] = False
        elif model_param['name'] == 'model_param_define':
            exists_model_define = True
        elif model_param['name'] == 'model_config':
            exists_model_config = True

    model_dict, model_params_value = model_service.generate_template_model_param(model_id)
    if not exists_model_config:
        model_config = {
            "name": "model_config",
            "type": "text",
            "value": model_dict['config']

        }
        model_params.append(model_config)
    if not exists_model_define:
        model_define_dict = PMCommonUtil.object_to_dict(model_dict['params_define'])
        model_param_define = {
            "name": "model_param_define",
            "type": "dict",
            "value": model_define_dict
        }
        model_params.append(model_param_define)
    return model_params


def publish_pm_flow(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)
    publish_type = params['publish_type']
    if PublishType.ADD.value == publish_type:
        id = __add_app(params)
    elif PublishType.UPDATE.value == publish_type:
        id = __update_app(params)
    else:
        raise exception.FLOW_PUBLISH_TYPE_NOT_SUPPORT
    return ResultMaker.success(id)


def get_pm_flow_variables(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    try:
        flow = Flow.objects.get(id=request.GET.get('flow_id'))
    except Exception as e:
        raise exception.FLOW_NOT_FOUND

    params = []
    if flow.params:
        params = JsonUtil.json_to_dict(flow.params)
    return ResultMaker.success(params)


def flow_running_check(pm_flow: PMFlow):
    import multiprocessing
    lock = multiprocessing.Lock()
    lock.acquire()

    flow_result_path = pm_flow.generate_flow_result_path()
    content = FileUtil.read(file_path=flow_result_path)
    if content:
        flow_dict = PMCommonUtil.json_to_dict(content)
        if flow_dict['status'] == PMFlowStatus.RUNNING.name:
            raise exception.FLOW_IS_ON_RUNNING_NOW
        else:
            # delete flow info
            FileUtil.delete_file(flow_result_path)
            FileUtil.delete_file(file_path=pm_flow.generate_flow_output_path())

    lock.release()


def check_input_node(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    id = request.GET.get('id')
    try:
        flow = Flow.objects.get(id=id)
    except Exception as e:
        raise exception.FLOW_NOT_FOUND

    if flow.config:
        flow.config = JsonUtil.json_to_dict(flow.config)

    nodes = flow.config['nodes']
    edges = flow.config['edges']
    pm_flow = PMFlow(id=flow.id, name=flow.name, nodes=nodes, edges=edges)
    # check
    PMFlow.check_input_node(pm_flow.nodes, pm_flow.edges)

    return ResultMaker.success({"result": "pass"})


def run_pm_flow(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)
    id = params['id']
    variables = params['variables']
    return ResultMaker.success(do_run_pm_flow(id=id, variables=variables))


def do_run_pm_flow(id, variables):
    for variable in variables:
        if PMCommonUtil.is_value_none("value", variable):
            raise exception.FLOW_RUN_VARIABLES_CAN_NOT_NULL

    try:
        flow = Flow.objects.get(id=id)
    except Exception as e:
        raise exception.FLOW_NOT_FOUND

    if flow.config:
        flow.config = JsonUtil.json_to_dict(flow.config)

    nodes = flow.config['nodes']
    edges = flow.config['edges']
    pm_flow = PMFlow(id=flow.id, name=flow.name, nodes=nodes, edges=edges)

    # judge current flow is running or not
    flow_running_check(pm_flow=pm_flow)

    pm_flow.run(variables=variables)
    result = {
        "result": id
    }
    return result

def sync_do_run_pm_flow(id, variables):
    if isinstance(variables, dict):
        variables = PMCommonUtil.convert_dict_to_list(variables)

    for variable in variables:
        if PMCommonUtil.is_value_none("value", variable):
            raise exception.FLOW_RUN_VARIABLES_CAN_NOT_NULL

    try:
        flow = Flow.objects.get(id=id)
    except Exception as e:
        raise exception.FLOW_NOT_FOUND

    if flow.config:
        flow.config = JsonUtil.json_to_dict(flow.config)

    nodes = flow.config['nodes']
    edges = flow.config['edges']
    pm_flow = PMFlow(id=flow.id, name=flow.name, nodes=nodes, edges=edges)

    # judge current flow is running or not
    flow_running_check(pm_flow=pm_flow)

    pm_flow.run(variables=variables, run_async=False)
    result = {
        "result": pm_flow.get_result()
    }
    return result


def get_pm_flow_run_status(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    return ResultMaker.success(query_pm_flow_run_status_info(flow_id=request.GET.get('id')))


def query_pm_flow_run_status_info(flow_id):
    file_path = PathUtil.get_flow_base_path() / ("%s/flow_running.info" % flow_id)
    running_info = FileUtil.read(file_path)
    if running_info:
        running_info = PMCommonUtil.json_to_dict(running_info)
    return running_info


def query_flow_run_status(flow_id):
    status = None
    running_info = query_pm_flow_run_status_info(flow_id=flow_id)
    if running_info:
        status = running_info['status']
    return status


def __add_app(params):
    flow_id = params['flow_id']
    flow = Flow.objects.get(id=flow_id)
    params['input_info'] = flow.params
    return app_service.add(params)


def __update_app(params):
    flow_id = params['flow_id']
    flow = Flow.objects.get(id=flow_id)
    params['input_info'] = flow.params
    return app_service.update(params)


def save_script_file(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    db_save_path, script_path, script_parent_path = __get_script_all_paths(params['flow_id'], params['node_id'])
    if not os.path.exists(script_path):
        if not os.path.exists(script_parent_path):
            os.makedirs(script_parent_path)

    with open(script_path, "w") as f:
        f.write(params['script_content'])

    result = {
        "script_path": db_save_path
    }
    return ResultMaker.success(result)


def get_script_content(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    flow_id = request.GET.get('flow_id')
    node_id = request.GET.get('node_id')

    db_save_path, script_path, script_parent_path = __get_script_all_paths(flow_id, node_id)
    if os.path.exists(script_path):
        with open(script_path, "r") as f:
            content = f.read()
    else:
        content = ""

    result = {
        "script_content": content
    }
    return ResultMaker.success(result)


def __get_script_all_paths(flow_id, node_id):
    script_parent_relative_path = "%s/%s" % (flow_id, node_id)
    script_relative_path = script_parent_relative_path + "/main.py"

    script_parent_absolute_path = PathUtil.get_flow_base_path() / script_parent_relative_path
    script_absolute_path = PathUtil.get_flow_base_path() / script_relative_path

    db_save_path = "%s/main.py" % node_id
    return db_save_path, script_absolute_path, script_parent_absolute_path


def __get_script_absolute_path(flow_id, node_id):
    db_save_path, script_absolute_path, script_parent_absolute_path = __get_script_all_paths(flow_id=flow_id,
                                                                                             node_id=node_id)
    return script_absolute_path


def add_flow_from_PMFlow(pm_flow):
    flow_id = pm_flow['id']
    name = pm_flow['name']
    description = name if 'description' not in pm_flow else pm_flow['description']

    exists = __check_name_exists(name)
    if exists:
        raise exception.FLOW_NAME_EXISTS

    flow_json = {
        "nodes": JsonUtil.object_to_dict(pm_flow['nodes']),
        "edges": JsonUtil.object_to_dict(pm_flow['edges'])
    }

    prompt_count, model_ids = __calculate_and_handle_nodes(flow_id, JsonUtil.object_to_dict(pm_flow['nodes']))

    # get input variables
    input_variables = PMFlow.get_flow_input_params(JsonUtil.object_to_dict(pm_flow['nodes']), JsonUtil.object_to_dict(pm_flow['edges']))

    flow = Flow(id=flow_id, name=name, description=description, config=JsonUtil.object_to_json(flow_json),
                prompt_count=prompt_count, model_ids=JsonUtil.object_to_json(model_ids), params=JsonUtil.object_to_json(input_variables),
                source=SourceType.USER.value, create_time=time.time(), update_time=time.time(), user_id=Constant.DEFAULT_USER_ID)

    flow.save()
    return ResultMaker.success(flow_id)


def delete_flow_and_app(request):
    if request.method != 'DELETE':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)
    id = params.get('id')

    # delete flow folder
    flow_path = PathUtil.get_flow_base_path() / id
    if os.path.exists(flow_path):
        shutil.rmtree(flow_path)

    # delete app
    try:
        app = App.objects.get(flow_id=id)
        app_id = app.id
    except Exception as e:
        app_id = None

    if app_id:
        App.objects.filter(id=app_id).delete()

    # delete flow
    Flow.objects.filter(id=id).delete()

    return ResultMaker.success(id)
