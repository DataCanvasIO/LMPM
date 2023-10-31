from promptmanager.runtime.exception.base_exception import RuntimeException


class ILLEGAL_MESSAGE_VARIABLES(RuntimeException):
    code = 20001
    message = u"message variables type is illegal,the variables should be dict[list]!"

class ILLEGAL_TEMPLATE_LIST_TYPE(RuntimeException):
    code = 20002
    message = u"template list property type is illegal,the template list property type should be PMPromptTemplate[list]!"

class ILLEGAL_PARAMS_TYPE(RuntimeException):
    code = 20003
    message = u"params type is illegal,the params type should be dict or dict[list]!"
