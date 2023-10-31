# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import base


class REQUEST_GET_NOT_SUPPORT(base.OK200):
    code = 1001
    message = u"request GET not support!!!"


class REQUEST_POST_NOT_SUPPORT(base.OK200):
    code = 1002
    message = u"request POST not support!!!"


class REQUEST_PUT_NOT_SUPPORT(base.OK200):
    code = 1003
    message = u"request PUT not support!!!"


class REQUEST_DELETE_NOT_SUPPORT(base.OK200):
    code = 1004
    message = u"request DELETE not support!!!"


class REQUEST_TYPE_NOT_SUPPORT(base.OK200):
    code = 1005
    message = u"request type error"


class FLOW_NOT_FOUND(base.OK200):
    code = 2001
    message = u"flow not exists"


class FLOW_NAME_EXISTS(base.OK200):
    code = 2002
    message = u"flow name exists"


class FLOW_MODULE_TYPE_NOT_SUPPORT(base.OK200):
    code = 2003
    message = u"flow node type not supported"


class FLOW_NODE_CREATE_ERROR(base.OK200):
    code = 2004
    message = u"flow node create error"


class FLOW_INPUT_NOT_EXIST(base.OK200):
    code = 2005
    message = u"flow input not exists"


class FLOW_TARGET_NODE_INPUT_NOT_MATCH(base.OK200):
    code = 2006
    message = u"flow target node input not match"


class FLOW_PUBLISH_TYPE_NOT_SUPPORT(base.OK200):
    code = 2007
    message = u"flow publish type is illegal!!!"


class FLOW_RUN_VARIABLES_CAN_NOT_NULL(base.OK200):
    code = 2008
    message = u"flow run variables can't be null"


class FLOW_IS_ON_RUNNING_NOW(base.OK200):
    code = 2009
    message = u"flow is on running now"


class FLOW_MODULE_ID_NOT_SUPPORT(base.OK200):
    code = 2010
    message = u"flow module id not support"



class FLOW_IS_PUBLISHED(base.OK200):
    code = 2011
    message = u"flow is published,can not save now!!!"


class CATEGORY_TYPE_CANNOT_BE_EMPTY(base.OK200):
    code = 3001
    message = u"category_type_cannot_be_empty"

class CATEGORY_NAME_REPEAT(base.OK200):
    def __init__(self, code=3002, message='category'):
        self.code = code
        self.message = message + "_name_repeat"

class CATEGORY_ID_CANNOT_BE_EMPTY(base.OK200):
    code = 3003
    message = u"category_id_cannot_be_empty"

class CATEGORY_NOT_EXISTS(base.OK200):
    code = 3004
    message = u"category_not_exists"

class MOVETYPE_NOT_SUPPORT(base.OK200):
    code = 3005
    message = u"movetype_not_support"

class THIS_CATEGORY_CANNOT_SUPPORT_CURRENT_MOVE_TYPE(base.OK200):
    code = 3006
    message = u"this_category_cannot_support_current_move_type"

class BE_DELETED_CATEGORY_TYPE_NOT_SUPPORT(base.OK200):
    code = 3007
    message = u"be_deleted_category_type_not_support"

class SYSTEM_CATEGORY_CANNOT_BE_DELETED(base.OK200):
    code = 3008
    message = u"system_category_cannot_be_deleted"

class SYSTEM_CATEGORY_CANNOT_BE_UPDATED(base.OK200):
    code = 3009
    message = u"system_category_cannot_be_updated"

class CATEGORY_NAME_CANNOT_BE_EMPTY(base.OK200):
    code = 3010
    message = u"category_name_cannot_be_empty"

class CATEGORY_LIST_CANNOT_BE_EMPTY(base.OK200):
    code = 3011
    message = u"category_list_cannot_be_empty"

class CATEGORY_TYPE_NOT_CONSISTENT(base.OK200):
    code = 3012
    message = u"category_type_not_consistent"

class PROMPT_NAME_REQUIRED(base.OK200):
    code = 4001
    message = u"prompt_name_required"

class PROMPT_CONTENT_REQUIRED(base.OK200):
    code = 4002
    message = u"prompt_content_required"

class PROMPT_SCENE_REQUIRED(base.OK200):
    code = 4003
    message = u"prompt_scene_required"

class PROMPT_ROLE_REQUIRED(base.OK200):
    code = 4004
    message = u"prompt_role_required"

class PROMPT_NAME_REPEAT(base.OK200):
    code = 4005
    message = u"prompt_name_repeat"

class PROMPT_ID_CANNOT_BE_EMPTY(base.OK200):
    code = 4006
    message = u"prompt_id_cannot_be_empty"

class PROMPT_NOT_EXISTS(base.OK200):
    code = 4007
    message = u"prompt_not_exists"


class PROMPT_ROLE_NOT_EXIST(base.OK200):
    code = 4008
    message = u"prompt_role_not_exist"

class PROMPT_CONTENT_CANNOT_BE_EMPTY(base.OK200):
    code = 4009
    message = u"prompt_content_cannot_be_empty"


class PROMPT_VARIABLE_ILLEGAL(base.OK200):
    code = 4010
    message = u"prompt_variable_illegal"


class APP_NOT_EXISTS(base.OK200):
    code = 5001
    message = u"app not exists"


class APP_NAME_REPEAT(base.OK200):
    code = 5002
    message = u"app name already exists"

class MODEL_NAME_REPEAT(base.OK200):
    code = 6001
    message = u"model name repeat"

class DEFAULT_MODEL_CANNOT_DELETE(base.OK200):
    code = 6002
    message = u"default model can't delete"

class MODEL_PARAM_MESSGAE_NOT_EXISTS(base.OK200):
    code = 6003
    message = u"model param ${message} not exists"

class MODEL_PARAM_RESULT_NOT_EXISTS(base.OK200):
    code = 6004
    message = u"model param ${result} not exists"

class MODEL_PARAM_NEST(base.OK200):
    code = 6005
    message = u"model param nest"

class MODEL_NOT_EXISTS(base.OK200):
    cpde = 6006
    message = u"model not exists"

class DEFAULT_MODEL_NOT_EXIST(base.OK200):
    code = 6007
    message = u"default model not exists"

class UPLOAD_FILE_CANNOT_BE_EMPTY(base.OK200):
    code = 7001
    message = u"upload file cannot be empty!"

class CHAT_COMPLETIONS_MESSAGE_CANNOT_BE_EMPTY(base.OK200):
    code = 7002
    message = u"messae cannot be empty!"

class CHAT_COMPLETIONS_MODEL_PARAMS_DEFINE_CANNOT_BE_EMPTY(base.OK200):
    code = 7003
    message = u"model params define cannot be empty!"

class CHAT_COMPLETIONS_CONFIG_CANNOT_BE_EMPTY(base.OK200):
    code = 7004
    message = u"config cannot be empty!"

class UPLOAD_FILE_TYPE_NOT_BE_ALLOWED(base.OK500):
    code = 7005
    message = u"upload file type not be allowed!"

class CHAT_COMPLETIONS_MODEL_PARAMS_CANNOT_BE_EMPTY(base.OK200):
    code = 7006
    message = u"model params cannot be empty!"

class FILE_NOT_EXIST(base.OK200):
    code = 7007
    message = u"file not exist!"