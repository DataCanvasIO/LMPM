import logging
from typing import Generator

from promptmanager.runtime.exception import template_exception
from promptmanager.runtime.model import PMLLM
from promptmanager.runtime.template import PMChatPromptTemplate

#设置日志控制台输出
logging.basicConfig(level="INFO", format="%(asctime)s - %(levelname)s: %(message)s", encoding="utf-8")
logger = logging.getLogger()

class PMChat(object):
    def __init__(self, template: PMChatPromptTemplate = None, pm_model: PMLLM = None):
        self.template = template
        self.pm_model = pm_model

    def run(self, variables: str, params=None):
        template = self.template
        pm_model = self.pm_model
        messages = template.messages(variables, True)
        logger.info("this chat message info: %s" % messages)
        if params:
            logger.info("this chat params info: %s" % params)
        else:
            logger.info("this chat params info: {}".format({}))

        #调用模型的request方法
        if not params:
            result = pm_model.request_result_by_message(messages)
            if isinstance(result, Generator):
                for line in result:
                    logger.info("%s" % line)
            else:
                logger.info("this chat result_content info: {}".format(result))
                return result
        else:
            if isinstance(params, dict) or isinstance(params, list):
                result = pm_model.request_result_by_message(messages, params)
                if isinstance(result, Generator):
                    for line in result:
                        logger.info("%s" % line)
                else:
                    logger.info("this chat result_content info: {}".format(result))
                    return result
            else:
                raise template_exception.ILLEGAL_PARAMS_TYPE()

