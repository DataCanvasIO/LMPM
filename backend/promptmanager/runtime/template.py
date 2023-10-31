import logging
import operator
import os
import re

from promptmanager import exception
from promptmanager.PromptManager.settings import base
from promptmanager.runtime.common_util import PMCommonUtil, FileUtil
from promptmanager.runtime.exception import template_exception

#设置日志控制台输出
logging.basicConfig(level="INFO", format="%(asctime)s - %(levelname)s: %(message)s")
logger = logging.getLogger()
# logger = logging.getLogger('pm_log')

class PMPromptTemplate(object):
    name = None
    role = None
    template_content = None
    role_prompt = None
    _variables = []
    _format_template_content = None

    def __init__(self, role: str = 'user', template_content: str = None, role_prompt: str = None):
        self.template_content = template_content
        self.role = role
        self.role_prompt = role_prompt
        self._variables = PMPromptTemplate.format_variables_info(self.template_content)
        self._format_template_content = PMPromptTemplate.format_template_content_method(self.template_content)

    @staticmethod
    def format_template_content_method(format_template_content):
        if format_template_content is None:
            raise exception.PROMPT_CONTENT_CANNOT_BE_EMPTY

        all_var = re.findall(r'\${.*?}', format_template_content)
        for var in all_var:
            param = var[2: len(var)-1]
            if operator.contains(param, ':'):
                param = param.split(":")[0]
            if operator.contains(param, '[file]'):
                new_param = param[0: param.index('[file]') + 6]
            elif operator.contains(param, '[text]'):
                new_param = param[0: param.index('[text]') + 6]
            else:
                new_param = param+"[text]"
            format_template_content = format_template_content.replace(var, '${'+new_param+'}')
        return format_template_content

    @staticmethod
    def format_variables_info(template_content):
        if template_content is None:
            raise exception.PROMPT_CONTENT_CANNOT_BE_EMPTY

        variables = []
        all_var = re.findall(r'\${(.*?)}', template_content)
        if len(all_var) == 0:
            return variables
        for var in all_var:
            if operator.contains(var, '[file]'):
                var_dict = PMPromptTemplate.get_special_type_var_dict(var, '[file]')
            elif operator.contains(var, '[text]'):
                var_dict = PMPromptTemplate.get_special_type_var_dict(var, '[text]')
            else:
                var_dict = PMPromptTemplate.get_normal_var_dict(var)
            if not PMPromptTemplate.validate_exists(variables, var_dict):
                variables.append(var_dict)
        return variables

    @staticmethod
    def validate_exists(variables, param_dict):
        for var in variables:
            # 判断name是否存在 type是否一致
            name = var['name']
            type = var['type']
            if param_dict['name'] == name and param_dict['type'] == type:
                return True
        return False

    @staticmethod
    def get_normal_var_dict(var):
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

    @staticmethod
    def get_special_type_var_dict(var, typeParam):
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

    def show_variables_info(self):
        logger.info("this prompt variables info:{}".format(self._variables))
        return self._variables

    @staticmethod
    def get_all_variables_value(variables, var_dict):
        all_variables_value = []
        variables_keys = list(var_dict.keys())
        for var in variables:
            name = var['name']
            type = var['type']
            default_value = var['defaultValue']
            new_var_name = name+"["+type+"]"
            #h获取new_var_value
            if name in variables_keys and type == 'text':
                new_var_value = var_dict[name]
            else:
                new_var_value = default_value
            # 组装成{name[text]/[file]}:value }格式
            all_variables_dict = {new_var_name: new_var_value}
            all_variables_value.append(all_variables_dict)

        return all_variables_value

    @staticmethod
    def value_by_key(variable, var):
        for key in variable:
            if key == var:
                return variable[key]
        return ""

    @staticmethod
    def get_file_content(filePath):
        pass


    def message(self, prompt_variables=None, actaully_value=False):
        if not prompt_variables:
            prompt_variables = self._variables

        messages = []
        message = {}
        format_template_content = self._format_template_content
        # 获取所有变量与value的dict数组
        # [{name[text]/[file]}:value}]
        variables = PMPromptTemplate.get_variables_by_promptVariables(self._variables, prompt_variables, actaully_value)

        all_var = re.findall(r'\${(.*?)}', format_template_content)
        for var in all_var:
            re_value = ""
            for variable in variables:
                re_value = self.value_by_key(variable, var)
                if re_value and len(re_value) > 0:
                    break
            if not re_value:
                re_value = ""
            format_template_content = format_template_content.replace("${" + var + "}", re_value)
        role = 'user'
        if self.role == 'assistant':
            role = 'assistant'
        if self.role == 'system':
            role = 'system'
        if self.role_prompt and len(self.role_prompt) > 0:
            role_message = {}
            role_message['role'] = 'system'
            role_message['content'] = self.role_prompt
            messages.append(role_message)
        message['role'] = role
        message['content'] = format_template_content
        messages.append(message)

        logger.info("this prompt message info:{}".format(PMCommonUtil.object_to_dict(messages)))
        return messages

    @staticmethod
    def get_variables_by_promptVariables(variables, promptVariables, actaully_value):
        all_variables_value = []
        for var in variables:
            name = var['name']
            type = var['type']
            default_value = var['defaultValue']
            new_var_name = name + "[" + type + "]"
            # 获取new_var_value
            new_var_value = PMPromptTemplate.get_new_var_value(name, type, default_value, promptVariables, actaully_value)
            # 组装成{name[text]/[file]}:value }格式
            all_variables_dict = {new_var_name: new_var_value}
            all_variables_value.append(all_variables_dict)

        return all_variables_value

    @staticmethod
    def get_new_var_value(name, type, default_value, promptVariables, actaully_value):
        if isinstance(promptVariables, dict):
            variables_keys = list(promptVariables.keys())
            if name in variables_keys and type == 'text':
                new_var_value = promptVariables[name]
            else:
                new_var_value = PMPromptTemplate.get_value_by_type(type, default_value, actaully_value)
        elif isinstance(promptVariables, list) and all([isinstance(item, dict) for item in promptVariables]):
            new_var_value = PMPromptTemplate.get_var_value(name, type, default_value, promptVariables, actaully_value)
        else:
            raise template_exception.ILLEGAL_MESSAGE_VARIABLES()
        return new_var_value

    @staticmethod
    def getFileContent(filePath):
        encodings = ['utf-8', 'gbk', 'utf-16', 'ANSI']
        content = ""
        if filePath:
            #判断是否是默认值文件名称
            original_name = os.path.basename(filePath)
            if original_name == filePath:
                filePath = os.path.join(base.PROMPT_FILE_UPLOAD_DEFAULT_PATH, original_name)
        if filePath and os.path.exists(filePath):
            read_char_length = base.CHAT_READ_FILE_MAX_LENGTH
            filename = os.path.basename(filePath)
            suffix = os.path.splitext(filename)[-1][1:]

            if suffix in ['doc', 'docx']:
                content = FileUtil.read_dox_file(filePath, suffix, read_char_length)
            elif suffix in ['xls', 'xlsx']:
                content = FileUtil.read_excel_file(filePath, read_char_length)
            else:
                # 读取txt csv tsv md json文件
                for encoding in encodings:
                    try:
                        with open(filePath, "r", encoding=encoding) as f:
                            content = f.read(read_char_length)
                            break
                    except UnicodeDecodeError:
                        continue
                if not content or len(content) == 0:
                    raise UnicodeDecodeError
        else:
            raise exception.FILE_NOT_EXIST
        return content

    @staticmethod
    def get_var_value(name, type, default_value, promptVariables, actaully_value):
        for promptVariable in promptVariables:
            var_name = promptVariable['name']
            var_type = promptVariable['type']
            var_default_value = promptVariable['defaultValue']
            var_value = promptVariable['value']

            if name == var_name and type == var_type:
                if var_value:
                    return PMPromptTemplate.get_value_by_type(type, var_value, actaully_value)
                elif var_default_value:
                    return PMPromptTemplate.get_value_by_type(type, var_default_value, actaully_value)
                else:
                    return PMPromptTemplate.get_value_by_type(type, default_value, actaully_value)
        return PMPromptTemplate.get_value_by_type(type, default_value, actaully_value)

    @staticmethod
    def get_value_by_type(type, var_value, actaully_value=False):
        value = ""
        if actaully_value:
            if type == 'text':
                value = var_value
            elif type == 'file':
                value = PMPromptTemplate.getFileContent(var_value)
        else:
            if type == 'file':
                value = os.path.basename(var_value)
            else:
                value = var_value
        return value

class PMChatPromptTemplate(object):
    template_list = []
    def __init__(self, template_list: [list] = []):
        if not isinstance(template_list, list) and all([isinstance(item, PMPromptTemplate) for item in template_list]):
            raise template_exception.ILLEGAL_TEMPLATE_LIST_TYPE()
        self.template_list = template_list

    def show_variables_info(self):
        variables_info = []
        template_list = self.template_list
        for template in template_list:
            variables = template.show_variables_info()
            variables_info.extend(variables)
        logger.info("this PMChat variables info: {}".format(PMCommonUtil.object_to_dict(variables_info)))
        return variables_info

    def messages(self, input_variables, actaully_value=False):
        messages = []
        template_list = self.template_list
        for template in template_list:
            message = template.message(prompt_variables=input_variables, actaully_value=actaully_value)
            messages.extend(message)
        logger.info("this PMChat messages info: {}".format(PMCommonUtil.object_to_dict(messages)))
        return messages
