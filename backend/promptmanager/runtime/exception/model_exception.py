from promptmanager.runtime.exception.base_exception import RuntimeException


class UNSUPPORTED_REQUEST_METHOD(RuntimeException):
    code = 10001
    message = u"unsupported request method"

class UNSUPPORTED_PARAMS_TYPE(RuntimeException):
    code = 10002
    message = u"unsupportes params type"

class DEFAULT_VALUE_IS_REQUIRED(RuntimeException):
    code = 10003
    message = u"default value is required"

class MESSAGE_PARAM_UNSUPPORTED_CUSTOM(RuntimeException):
    code = 10004
    message = u"message param unsupported custom"

class RESULT_PARAM_UNSUPPORTED_CUSTOM(RuntimeException):
    code = 10005
    message = u"result param unsupported custom"

class REQUEST_ERROR(RuntimeException):
    def __init__(self, code, message):
        self.code = code
        self.message = message

class PARAM_FORMAT_ERROR(RuntimeException):
    def __init__(self, code, message):
        self.code = code
        self.message = message

class PROXY_NOT_CONFIG(RuntimeException):
    code = 10008
    message = u"proxy not config"
