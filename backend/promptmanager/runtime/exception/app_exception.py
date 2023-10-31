from promptmanager.runtime.exception.base_exception import RuntimeException


class PUBLISH_FROM_FLOW_ERROR(RuntimeException):
    def __init__(self, code, message):
        self.code = code
        self.message = message


class RUN_APP_ERROR(RuntimeException):
    def __init__(self, code, message):
        self.code = code
        self.message = message
