import json
import logging
import operator
import re
import time
import uuid
import urllib.parse

from django.core.paginator import Paginator
from django.forms import model_to_dict

from promptmanager.app_prompt.models import Category, Prompt
from promptmanager.app_common.category_type_default import CategoryTypeDefault
from promptmanager.app_common.collect_status_type import CollectStatus
from promptmanager.app_common.constant import Constant
from promptmanager.app_common.database_util import DatabaseUtil
from promptmanager.app_common.enum_source_type import SourceType
from promptmanager.app_common.http_request_util import HttpRequestUtil
from promptmanager.app_common.json_util import JsonUtil
from promptmanager.app_common.result_maker import ResultMaker
from promptmanager.exception import exception

role_type = "role"
scene_type = "scene"
label_type = "label"
move_type_up = "up"
move_type_down = "down"

def category_add(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    request_body = request.body
    params = json.loads(request_body.decode())

    id = uuid.uuid4()
    name = params.get('name')
    role_prompt = params.get('role_prompt', "")
    type = params.get('type')
    if type == None:
        raise exception.CATEGORY_TYPE_CANNOT_BE_EMPTY()
    if name == None:
        raise exception.CATEGORY_NAME_CANNOT_BE_EMPTY()

    #检验名称是否重复
    repeateCount = DatabaseUtil.query(query_sql='select count(1) from "class" where type = %s and name = %s',
                       params=[type, name])
    if repeateCount[0][0] > 0:
       raise exception.CATEGORY_NAME_REPEAT(message=type)

    #获取orderId
    if type == scene_type:
       orderId = DatabaseUtil.query(query_sql='select order_id from "class" where type = %s and name != %s order by order_id desc limit 1', params=[type, 'Others'])
    else:
       orderId = DatabaseUtil.query(query_sql='select order_id from "class" where type = %s order by order_id desc limit 1', params=[type])

    if len(orderId) == 0:
        orderId = 1
    else:
        orderId = orderId[0][0] + 1

    category = Category(id=id, name=name, source=SourceType.USER.value, create_time=time.time(),
                        update_time=time.time(), type=type, role_prompt=role_prompt, user_id=Constant.DEFAULT_USER_ID, order_id=orderId)
    category.save()
    return ResultMaker.success(id)

def category_name_validate(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    name = request.GET.get('name')
    type = request.GET.get('type')
    if name:
        name = urllib.parse.unquote(name)
    if type:
        type = urllib.parse.unquote(type)
    exist_obj = DatabaseUtil.query(query_sql='select count(1) from "class" where type = %s and name = %s', params=[type, name])

    is_exist = False
    if exist_obj[0][0] > 0:
        is_exist = True

    result = {"exists": is_exist}
    return ResultMaker.success(result)

def category_list(request):
    order_key = request.GET.get('orderKey', 'order_id')
    order_by = request.GET.get('orderBy', 'asc')
    keywords = request.GET.get('keywords', None)
    type = request.GET.get("type", "scene")
    if order_by == 'desc':
        order_key = '-' + order_key
    if keywords:
        keywords = urllib.parse.unquote(keywords)

    if keywords != None:
        category_list = Category.objects.filter(type=type, name__contains=keywords).order_by(order_key)
    else:
        category_list = Category.objects.filter(type=type).order_by(order_key)

    result_list = []
    for category in category_list:
        json_dict = model_to_dict(category)
        result_list.append(json_dict)

    category_result = {
        'count': category_list.count(),
        'rows': result_list
    }
    return ResultMaker.success(category_result)

def category_update(request):
    if request.method != 'PUT':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()
    request_body = request.body
    params = json.loads(request_body.decode())
    id = params.get('id')
    name = params.get('name')
    role_prompt = params.get('role_prompt')
    if id == None:
        raise exception.CATEGORY_ID_CANNOT_BE_EMPTY()

    try:
        category = Category.objects.get(id=id)
    except Category.DoesNotExist:
        raise exception.CATEGORY_NOT_EXISTS()
    type = category.type
    source = category.source
    #系统预置的不能被编辑
    if source == SourceType.SYSTEM.value:
        raise exception.SYSTEM_CATEGORY_CANNOT_BE_UPDATED
    if name == None:
        raise exception.CATEGORY_NAME_CANNOT_BE_EMPTY()

    #校验名称是否重复
    repeateCount = DatabaseUtil.query(query_sql='select count(1) from "class" where type = %s and name = %s and id != %s',
                                      params=[type, name, id])
    if repeateCount[0][0] > 0:
        raise exception.CATEGORY_NAME_REPEAT(message=type)

    if type == role_type and role_prompt != None:
        Category.objects.filter(id=id).update(name=name, role_prompt=role_prompt, update_time=time.time())
    else:
        Category.objects.filter(id=id).update(name=name, update_time=time.time())

    return ResultMaker.success(id)

def category_delete_validate(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    id = request.GET.get('id')
    try:
        category = Category.objects.get(id=id)
    except Category.DoesNotExist:
        return ResultMaker.success(False)
    type = category.type
    source = category.source
    if source == SourceType.SYSTEM.value:
        raise exception.SYSTEM_CATEGORY_CANNOT_BE_DELETED

    if type == label_type:
        return ResultMaker.success("false")
    elif type == role_type:
        sql_condition = 'and role_id '
    elif type == scene_type:
        sql_condition = 'and scene_id '
    else:
        raise exception.BE_DELETED_CATEGORY_TYPE_NOT_SUPPORT

    if sql_condition is not None:
        query_sql = 'select count(1) from "prompt" where 1=1 ' + sql_condition + ' = %s'
        result = DatabaseUtil.query(query_sql=query_sql, params=[id])
        if result[0][0] > 0:
            return ResultMaker.success(True)
    return ResultMaker.success(False)

def category_delete(request):
    if request.method != 'DELETE':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    request_body = request.body
    params = json.loads(request_body.decode())
    id = params.get('id')
    #调用删除方法
    delete_method(id)
    return ResultMaker.success(id)

def delete_method(id):
    try:
        category = Category.objects.get(id=id)
    except Category.DoesNotExist:
        raise exception.CATEGORY_NOT_EXISTS()
    categoryId = category.id
    type = category.type
    source = category.source
    if source == SourceType.SYSTEM.value:
        raise exception.SYSTEM_CATEGORY_CANNOT_BE_DELETED

    #对引用该筛选项的prompt特殊处理
    defaultId = CategoryTypeDefault.getDefaultIdByType(type.upper())

    query_sql = 'select * from "prompt" where 1=1 '
    try:
        if type == role_type:
            query_sql = query_sql + 'and "role_id" = %s '
            prompts = DatabaseUtil.query(query_sql=query_sql, params=[categoryId])
            for prompt in prompts:
                Prompt.objects.filter(id=prompt[0]).update(role_id=defaultId)
        elif type == scene_type:
            query_sql = query_sql + 'and "scene_id" = %s '
            prompts = DatabaseUtil.query(query_sql=query_sql, params=[categoryId])
            for prompt in prompts:
                Prompt.objects.filter(id=prompt[0]).update(scene_id=defaultId)
        elif type == label_type:
            query_sql = query_sql + 'and "labels_ids" like "%'+categoryId+'%" '
            prompts = DatabaseUtil.query(query_sql=query_sql)
            for prompt in prompts:
                labels_arr = eval(prompt[7])
                labels_arr.remove(categoryId)
                labels_id = str(labels_arr)
                Prompt.objects.filter(id=prompt[0]).update(labels_ids=labels_id)

        Category.objects.filter(id=id).delete()
    except Exception as e:
        logging.exception(e)
        return

def category_move_order(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()
    request_body = request.body
    params = json.loads(request_body.decode())
    moveType = params.get('moveType')
    categoryId = params.get('categoryId')

    """
    validate
    """
    if moveType not in [move_type_up, move_type_down]:
        raise exception.MOVETYPE_NOT_SUPPORT()
    try:
        category = Category.objects.get(id=categoryId)
    except Category.DoesNotExist:
        raise exception.CATEGORY_NOT_EXISTS()

    type = category.type
    sourceOrderId = category.order_id
    """
    get targtOrderId
    """
    if moveType == move_type_up:
        order_filter = '<'
        orderBy = 'desc'
    elif moveType == move_type_down:
        order_filter = '>'
        orderBy = 'asc'
    query_sql = 'select "id","order_id" from "class" where "type" = %s and "order_id" '+order_filter+' %s order by "order_id" '+orderBy+' limit 1'
    categorys = DatabaseUtil.query(query_sql=query_sql,
                       params=[type, sourceOrderId])
    if categorys is not None and len(categorys) != 0:
        for category in categorys:
            targetCategoryId = category[0]
            targetOrderId = category[1]
        """
        update order_id
        """
        Category.objects.filter(id=categoryId).update(order_id=targetOrderId)
        Category.objects.filter(id=targetCategoryId).update(order_id=sourceOrderId)
    else:
        raise exception.THIS_CATEGORY_CANNOT_SUPPORT_CURRENT_MOVE_TYPE()

    return ResultMaker.success(categoryId)

def category_batch_operate(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()
    params = HttpRequestUtil.get_http_request_body(request)
    new_category_list = params['category_list']
    type = params['type']
    datetime = time.time()
    if type == None:
        raise exception.CATEGORY_TYPE_CANNOT_BE_EMPTY()
    if new_category_list is None or len(new_category_list) == 0:
        raise exception.CATEGORY_LIST_CANNOT_BE_EMPTY()
    try:
        category_list_to_insert = list()

        #查出数据库所有的当前type的category，得到old_category_list
        old_category_list = DatabaseUtil.query(query_sql='select * from "class" where type = %s ', params=[type], return_dict=True)
        new_category_id_list = [category['id'] for category in new_category_list]

        for x in range(len(old_category_list)):
            # 特殊处理被删除的category
            oldCategory = old_category_list[x]
            categoryId = oldCategory['id']
            if categoryId not in new_category_id_list:
                delete_method(categoryId)

        #批量处理category_list
        DatabaseUtil.query(query_sql='delete from "class" where type = %s ', params=[type], return_dict=False)
        for x in range(len(new_category_list)):
            newCategory = new_category_list[x]
            categoryType = newCategory['type']
            if categoryType != type:
                raise exception.CATEGORY_TYPE_NOT_CONSISTENT()

            if newCategory.__contains__('role_prompt'):
                role_prompt = newCategory['role_prompt']
            else:
                role_prompt = None

            category_list_to_insert.append(
                Category(id=newCategory['id'], name=newCategory['name'], source=newCategory['source'], create_time=datetime, update_time=datetime, type=newCategory['type'], role_prompt=role_prompt, user_id=Constant.DEFAULT_USER_ID, order_id=newCategory['order_id']))

        Category.objects.bulk_create(category_list_to_insert)
        return ResultMaker.success("success")
    except Exception as e:
        raise e
    return ResultMaker.success("fail")

def validateResultToModel(query_result):
    re_data = []
    for item in list(query_result):
        prompt = Prompt(item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], item[8],
                  item[9], item[10], item[11], item[12], item[13])
        prompt_dict = model_to_dict(prompt)

        getCategoryInfo(prompt, prompt_dict)
        re_data.append(prompt_dict)
    return re_data


def dealKeyword(keywords, re_data):
    re_result = []
    name_contains_keywords = []
    content_contains_keywords = []
    for prompt in list(re_data):
        prompt_name = prompt['name']
        prompt_content = prompt['prompt']
        if operator.contains(prompt_name.lower(), keywords.lower()):
            name_contains_keywords.append(prompt)
        elif operator.contains(prompt_content.lower(), keywords.lower()):
            content_contains_keywords.append(prompt)
    re_result.extend(name_contains_keywords)
    re_result.extend(content_contains_keywords)
    return re_result

def prompt_page(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT

    page_num = request.GET.get('pageIndex', 1)
    page_size = request.GET.get('pageNum', 15)
    order_key = request.GET.get('orderKey', 'update_time')
    order_by = request.GET.get('orderBy', 'desc')
    keywords = request.GET.get('keywords', None)
    scene_id = request.GET.get('scene_id', None)
    role_id = request.GET.get('role_id', None)
    label_id = request.GET.get('labels_ids', None)
    if keywords:
        keywords = urllib.parse.unquote(keywords)

    format_scene = None
    format_role = None
    query_sql = 'select * from "prompt" where 1=1  '
    if keywords:
        query_sql = query_sql + 'and ("name" like "%'+keywords+'%" or "prompt" like "%'+keywords+'%") '
    if label_id and label_id != 'ALL':
        label_list = label_id.split(",")
        query_condition = '('
        for labelId in label_list:
            query_condition = query_condition + 'labels_ids like "%' + labelId + '%" or '
        query_condition = query_condition.rstrip("or ")
        query_sql = query_sql + 'and ' + query_condition + ')'
    if scene_id and scene_id != 'ALL':
        scene_list = scene_id.split(",")
        query_sql = query_sql + ' and scene_id in ({}) '
        format_scene = ",".join(['"%s"' % item for item in scene_list])
    if role_id and role_id != 'ALL':
        role_list = role_id.split(",")
        query_sql = query_sql + ' and role_id in ({}) '
        format_role = ",".join(['"%s"' % item for item in role_list])

    query_sql = query_sql + ' order by ' + order_key + ' ' + order_by

    if format_scene is not None and format_role is not None:
       query_sql = query_sql.format(format_scene, format_role)
    elif format_scene is not None:
       query_sql = query_sql.format(format_scene)
    elif format_role is not None:
        query_sql = query_sql.format(format_role)
    query_result = DatabaseUtil.query(query_sql=query_sql)

    re_data = validateResultToModel(query_result)
    #处理name包含关键字的放在前面
    if keywords:
        re_data = dealKeyword(keywords, re_data)
    p = Paginator(re_data, page_size)
    page_data = p.page(page_num)

    page_result = {
        'count': len(re_data),
        'rows': list(page_data)
    }
    return ResultMaker.success(page_result)


def validatePromptParam(name, prompt, scene_id, role_id):
    if name == None:
        raise exception.PROMPT_NAME_REQUIRED()
    if prompt == None:
        raise exception.PROMPT_CONTENT_REQUIRED()
    if scene_id == None:
        raise exception.PROMPT_SCENE_REQUIRED()
    if role_id == None:
        raise exception.PROMPT_ROLE_REQUIRED()

def prompt_name_validate(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    name = request.GET.get('name')
    if name:
        name = urllib.parse.unquote(name)
    exist_obj = DatabaseUtil.query(query_sql='select count(1) from "prompt" where name = %s', params=[name])

    is_exist = False
    if exist_obj[0][0] > 0:
        is_exist = True

    result = {"exists": is_exist}
    return ResultMaker.success(result)

def prompt_add(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)

    id = uuid.uuid4()
    name = params.get('name')
    note = params.get('note', '')
    prompt = params.get('prompt')
    variables = params.get('variables', [])
    scene_id = params.get('scene_id')
    role_id = params.get('role_id')
    labels_ids = params.get('labels_ids', [])
    score = params.get('score')

    #validate
    validatePromptParam(name, prompt, scene_id, role_id)

    # 检验名称是否重复
    repeateCount = DatabaseUtil.query(query_sql='select count(1) from "prompt" where name = %s',
                                      params=[name])
    if repeateCount[0][0] > 0:
        raise exception.PROMPT_NAME_REPEAT()

    if variables:
        variables = JsonUtil.object_to_json(variables)
    prompt = Prompt(id=id, name=name, prompt=prompt, variables=variables, scene_id=scene_id, role_id=role_id, note=note, labels_ids=labels_ids, source=SourceType.USER.value,
                    create_time=time.time(), update_time=time.time(), user_id=Constant.DEFAULT_USER_ID, collecte_status=CollectStatus.UNCOLLECTED.value, score=score)
    prompt.save()
    return ResultMaker.success(id)


def getCategoryInfo(prompt, prompt_dict):
    scene_id = prompt.scene_id
    role_id = prompt.role_id
    try:
        scene = Category.objects.get(id=scene_id)
        prompt_dict['scene_name'] = scene.name
    except Category.DoesNotExist:
        prompt_dict['scene_name'] = None

    try:
        role = Category.objects.get(id=role_id)
        prompt_dict['role_name'] = role.name
        prompt_dict['role_prompt'] = role.role_prompt
    except Category.DoesNotExist:
        prompt_dict['role_name'] = None
        prompt_dict['role_prompt'] = None

    try:
        if prompt.labels_ids is not None:
            labels_ids = prompt.labels_ids
            label_list = eval(labels_ids)
            labes_name = []
            for labelId in label_list:
                label = Category.objects.get(id=labelId)
                labes_name.append(label.name)
            prompt_dict['labes_name'] = labes_name
    except Category.DoesNotExist:
        prompt_dict['labes_name'] = []
    prompt_dict['labels_ids'] = label_list

    variables = prompt_dict['variables']
    if variables is None or len(variables) == 0:
        prompt_dict['variables'] = []
    else:
        prompt_dict['variables'] = JsonUtil.json_to_dict(variables)


def prompt_detail(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    id = request.GET.get("id")
    if id == None:
       raise exception.PROMPT_ID_CANNOT_BE_EMPTY()

    try:
        prompt = Prompt.objects.get(id=id)
    except Prompt.DoesNotExist:
        raise exception.PROMPT_NOT_EXISTS()

    prompt_dict = model_to_dict(prompt)
    #获取模板筛选项信息
    getCategoryInfo(prompt, prompt_dict)
    return ResultMaker.success(prompt_dict)

def prompt_update(request):
    if request.method != 'PUT':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)
    id = params.get('id')
    if id == None:
        raise exception.PROMPT_ID_CANNOT_BE_EMPTY()
    name = params.get('name')
    note = params.get('note', '')
    promptContent = params.get('prompt')
    variables = params.get('variables', [])
    scene_id = params.get('scene_id')
    role_id = params.get('role_id')
    labels_id = params.get('labels_ids', [])
    source = params.get('source')
    score = params.get('score')

    try:
        Prompt.objects.get(id=id)
    except Prompt.DoesNotExist:
        raise exception.PROMPT_NOT_EXISTS()

    #校验名称是否重复
    if name:
        repeateCount = DatabaseUtil.query(query_sql='select count(1) from "prompt" where name = %s and id != %s',
                                      params=[name, id])
        if repeateCount[0][0] > 0:
            raise exception.PROMPT_NAME_REPEAT()

    if source is None:
        source = SourceType.USER.value

    if variables:
        variables = JsonUtil.object_to_json(variables)

    if name:
        Prompt.objects.filter(id=id).update(name=name, prompt=promptContent, variables=variables, scene_id=scene_id, role_id=role_id, source=source, note=note, labels_ids=labels_id, update_time=time.time())
    else:
        Prompt.objects.filter(id=id).update(score=score)
    return ResultMaker.success(id)

def prompt_delete(request):
    if request.method != 'DELETE':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)
    id = params.get('id')
    try:
        Prompt.objects.get(id=id)
    except Prompt.DoesNotExist:
        raise exception.PROMPT_NOT_EXISTS()

    Prompt.objects.filter(id=id).delete()
    return ResultMaker.success(id)


def generate_template_role_info(role_id):
    try:
        role = Category.objects.get(id=role_id)
    except Exception as e:
        raise exception.PROMPT_ROLE_NOT_EXIST

    return role.name, role.role_prompt


def validateExists(variables, param_dict):
    for var in variables:
        # 判断name是否存在 type是否一致
        name = var['name']
        type = var['type']
        if param_dict['name'] == name and param_dict['type'] == type:
            return True
    return False


def getNormalVarDict(var):
    var_dict = {}
    if operator.contains(var, ':'):
        var_component = var.split(":")
        var_dict.update({"name": var_component[0]})
        var_dict.update({"defaultValue": var_component[1]})
    else:
        var_dict.update({"name": var})
        var_dict.update({"defaultValue": ""})
    var_dict.update({"value": None})
    var_dict.update({"type": "text"})
    return var_dict


def getSpecialTypeVarDict(var, typeParam):
    var_dict = {}
    var_type = re.findall(r'\[(.*?)]', var)
    if operator.contains(var, ':'):
        var_component = var.split(":")
        name_type = var_component[0]
        var_name = name_type.split(typeParam)[0]
        var_dict.update({"name": var_name})
        var_dict.update({"defaultValue": var_component[1]})
    else:
        var_name = var.split(typeParam)[0]
        var_dict.update({"name": var_name})
        var_dict.update({"defaultValue": ""})
    var_dict.update({"value": None})
    var_dict.update({"type": var_type[0]})
    return var_dict


def variables_parse(request):
    if request.method != 'POST':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    params = HttpRequestUtil.get_http_request_body(request)
    prompt_content = params["prompt"]
    if prompt_content is None:
        raise exception.PROMPT_CONTENT_CANNOT_BE_EMPTY

    variables = []
    all_var = re.findall(r'\${(.*?)}', prompt_content)
    if len(all_var) == 0:
        return variables
    for var in all_var:
        if operator.contains(var, '[file]'):
            var_dict = getSpecialTypeVarDict(var, '[file]')
        if operator.contains(var, '[text]'):
            var_dict = getSpecialTypeVarDict(var, '[text]')
        else:
            var_dict = getNormalVarDict(var)
        if not validateExists(variables, var_dict):
            variables.append(var_dict)

    return ResultMaker.success(variables)

def getPromptList(variables, param, validateKey, targetKey, prompt):
    prompt_list = []
    prompt_dict = {}
    for var in variables:
        # 判断name是否存在
        if param == var[validateKey]:
            prompt_list = var[targetKey]
            prompt_list.append(prompt)
            var[targetKey] = prompt_list
    else:
        prompt_list.append(prompt)
        prompt_dict['scene_name'] = param
        prompt_dict['prompt_list'] = prompt_list
        variables.append(prompt_dict)


def addPrompt(prompt_list, prompt):
    if prompt["id"]:
        variables = prompt['variables']
        labels_ids = prompt['labels_ids']
        if variables:
            prompt['variables'] = JsonUtil.json_to_dict(variables)
        else:
            prompt['variables'] = []

        if labels_ids:
            prompt['labels_ids'] = eval(prompt['labels_ids'])
        else:
            prompt['labels_ids'] = []
        prompt_list.append(prompt)

def scenegroup_list(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    result_list = []
    keywords = request.GET.get('keyWords', None)
    query_sql = 'select  c."name" as scene_name,c."id" as scene_id,c2.name as role_name,c2.role_prompt ,p.* from (select * from class where TYPE ="scene") c left join prompt p on c.id =p.scene_id  left join class c2 on p.role_id =c2.id '
    if keywords:
        query_sql = query_sql + "where p.name like '%"+ keywords +"%'"
    query_sql = query_sql + " order by c.order_id , p.update_time desc "
    query_list = DatabaseUtil.query(query_sql=query_sql, params=None, return_dict=True)

    for prompt in query_list:
        scene_name = prompt['scene_name']
        prompt_list = []
        prompt_dict = {}
        for i in range(len(result_list)):
            result = result_list[i]
            # 判断name是否存在
            if scene_name == result['scene_name']:
                prompt_list = result['prompt_list']
                addPrompt(prompt_list, prompt)
                result['prompt_list'] = prompt_list
                result_list[i] = result
        if len(prompt_list) == 0:
            addPrompt(prompt_list, prompt)
            prompt_dict['scene_name'] = scene_name
            prompt_dict['prompt_list'] = prompt_list
            result_list.append(prompt_dict)
    return ResultMaker.success(result_list)

def prompt_list(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT

    query_sql = "select * from prompt order by update_time desc"
    query_result = DatabaseUtil.query(query_sql=query_sql, return_dict=False)
    re_data = validateResultToModel(query_result)

    list_result = {
        'count': len(re_data),
        'rows': re_data
    }
    return ResultMaker.success(list_result)

