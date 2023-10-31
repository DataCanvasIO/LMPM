from promptmanager.runtime.exception.base_exception import RuntimeException


class ILLEGAL_EDGE_INFO(RuntimeException):
    code = 10001
    message = u"edge info is illegal!!!"


class FLOW_INPUT_NOT_EXIST(RuntimeException):
    code = 10002
    message = u"flow input is not exists!!!"


class FLOW_TARGET_NODE_INPUT_NOT_MATCH(RuntimeException):
    code = 10003
    message = u"flow target node input not match!!!"


class FLOW_RUN_VARIABLES_ILLEGAL(RuntimeException):
    code = 10004
    message = u"run flow variables illegal"


class Flow_NODE_NOT_EXIST(RuntimeException):
    code = 10005
    message = u"flow node not exists"


class FLOW_RUN_EXCEPTION(RuntimeException):
    code = 10006
    message = u"flow run exception"


class NODE_PARAMS_ILLEGAL(RuntimeException):
    def __init__(self, code=10007, param_name: str = None):
        self.code = code
        self.message = "node param illegal:" + param_name


class FLOW_INPUT_NODE_CONNCTS_NO_EDGE(RuntimeException):
    code = 10008
    message = u"The input node is not connected."


class DINGO_QUERY_ERROR(RuntimeException):
    def __init__(self, code=10009, message: str = None):
        self.code = code
        self.message = message
