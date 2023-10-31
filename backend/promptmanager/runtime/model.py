import os

import requests
import operator
import json
import logging
from promptmanager.PromptManager.settings import base

from pathlib import Path

from promptmanager.runtime.common_util import PMCommonUtil
from promptmanager.runtime.exception import model_exception

logger = logging.getLogger('root')


class PMBaseAIModel:
    def __init__(self, config, params_define):
        self.config = config
        self.params_define = params_define
        model_path_dict = PMLLM.get_model_path_dict(config, params_define)
        model_role = PMLLM.get_model_role(config, params_define)
        self._content_path = model_path_dict['content_path']
        self._result_path = model_path_dict['result_path']
        self._error_messge_path = model_path_dict['error_message_path'] if 'error_message_path' in model_path_dict else None
        self._stream_result_path = model_path_dict['stream_result_path'] if 'stream_result_path' in model_path_dict else None
        self._stream_content_path = model_path_dict['stream_content_path'] if 'stream_content_path' in model_path_dict else None
        self._model_role = model_role

    def show_params_info(self):
        return PMCommonUtil.object_to_dict(self.params_define)

    @staticmethod
    def base_request(method, url, header, requestBody, stream=False):
        model_proxy = os.getenv('MODEL_PROXY') if os.getenv('MODEL_PROXY') is not None else None
        proxy = None
        if model_proxy:
            proxy = {
                'http': model_proxy,
                'https': model_proxy
            }
        logger.info('model proxy: ' + str(proxy))
        method_lower_str = str(method).lower()
        if method_lower_str == 'get':
            response = requests.get(url=url)
        elif method_lower_str == 'post':
            if stream:
                response = requests.post(url=url, headers=header, json=requestBody, proxies=proxy, stream=stream)
            else:
                response = requests.post(url=url, headers=header, json=requestBody, proxies=proxy)
        else:
            raise model_exception.UNSUPPORTED_REQUEST_METHOD()

        return response

    def request(self, requestBody, params=None, is_result=False):
        stream = requestBody['stream'] if 'stream' in requestBody else False
        if stream:
            return PMBaseAIModel.request_stream(self, requestBody, params, is_result)
        else:
            return PMBaseAIModel.request_no_stream(self, requestBody, params)

    def request_no_stream(self, requestBody, params=None):
        config = self.config
        params_define = self.params_define

        params_config = PMBaseAIModel.get_param_config(config, params_define, params, check_default_value=True,
                                                       replace_message=True)
        url = params_config['url']
        header = params_config['header']

        response = PMBaseAIModel.base_request('POST', url, header, requestBody)
        response_text = response.text
        if response.status_code != 200 and PMCommonUtil.is_json(response_text):
            try:
                error_message = PMBaseAIModel.get_error_message(self, json.loads(response_text))
            except Exception as e:
                error_message = response_text
            raise model_exception.REQUEST_ERROR(10006, error_message)
        try:
            return json.loads(response_text)
        except Exception as e:
            return str(response_text)

    def request_stream(self, requestBody, params=None, is_result=False):
        config = self.config
        params_define = self.params_define

        params_config = PMBaseAIModel.get_param_config(config, params_define, params, check_default_value=True,
                                                       replace_message=True)
        url = params_config['url']
        header = params_config['header']

        response = PMBaseAIModel.base_request('POST', url, header, requestBody, stream=True)
        if response.status_code == 200:
            for line in response.iter_lines():
                if not line:
                    continue
                else:
                    try:
                        line = line.decode("utf-8")[6:]
                        if line != "[DONE]":
                            stream_response = json.loads(line)
                            if is_result:
                                result = PMBaseAIModel.get_response_result(stream_response, self._stream_content_path)
                                if result != '' and not result:
                                    result = PMBaseAIModel.get_response_result(stream_response, self._stream_result_path)
                                    if result and 'finish_reason' in result[0] and result[0]['finish_reason'] == 'stop':
                                        result = ''
                                    if result != '' and not result:
                                        result = stream_response
                            else:
                                result = PMBaseAIModel.get_response_result(stream_response, self._stream_result_path)
                                if result and 'finish_reason' in result[0] and result[0]['finish_reason'] == 'stop':
                                    result = ''
                                if result != '' and not result:
                                    result = stream_response
                            yield result
                        else:
                            yield line
                    except StopIteration:
                        break
        else:
            try:
                response_text = response.text
                error_message = PMBaseAIModel.get_error_message(self, json.loads(response_text))
            except Exception as e:
                error_message = response_text
            raise model_exception.REQUEST_ERROR(10006, error_message)

    def get_error_message(self, response_text):
        for key in self._error_messge_path:
            response_text = response_text[key]
        return response_text

    @staticmethod
    def get_param_config(config, params_define, params=None, message=None, replace_result=False, check_default_value=False, replace_message=False):
        # first filter by custom params
        if params:
            if isinstance(params, dict):
                for key in params:
                    param_name = '${' + key + '}'
                    if param_name == '${message}':
                        raise model_exception.MESSAGE_PARAM_UNSUPPORTED_CUSTOM
                    if param_name == '${result}':
                        raise model_exception.RESULT_PARAM_UNSUPPORTED_CUSTOM
                    if param_name == '${errorMessage}':
                        continue
                    param_value = params[key]
                    config = config.replace(param_name, str(param_value))
            elif isinstance(params, list):
                for param in params:
                    if PMCommonUtil.is_value_none('value', param):
                        logger.info('param value not exists')
                        continue
                    param_name = '${' + param['name'] + '}'
                    if param_name == '${message}':
                        raise model_exception.MESSAGE_PARAM_UNSUPPORTED_CUSTOM
                    if param_name == '${result}':
                        raise model_exception.RESULT_PARAM_UNSUPPORTED_CUSTOM
                    if param_name == '${errorMessage}':
                        continue
                    param_value = param['value']
                    config = config.replace(param_name, str(param_value))
            else:
                raise model_exception.UNSUPPORTED_PARAMS_TYPE()

        # second filter by params_define
        for param in params_define:
            param_name = '${' + param['name'] + '}'
            if not operator.contains(config, param_name):
                continue
            if param_name == '${errorMessage}':
                continue
            if operator.contains(str(param['type']).lower(), 'json'):
                default_value = param['defaultValue']
            else:
                default_value = str(param['defaultValue'])
            if str(param['type']).lower() == 'select':
                default_values = default_value.split(';')
                default_value = default_values[0]
            value = None
            param_value = default_value
            if 'value' in param:
                if param['value'] is not None:
                    value = str(param['value'])
            if param_name == '${message}':
                if replace_message:
                    value = ''
                    message_fill = False
                    if message is None or not operator.contains(message, "${role}") or not operator.contains(message, "${content}"):
                        message_fill = True
                    if message_fill:
                        if message is not None and str(param['type']).lower() == 'json':
                            if isinstance(param_value, list):
                                raise model_exception.PARAM_FORMAT_ERROR(10007, 'message param format error!')
                            for key in list(param_value.keys()):
                                for msg in message:
                                    role_msg = msg['role'] + ' \\n'
                                    content_msg = PMBaseAIModel.escape_character(content_msg)
                                    content_msg = msg['content'] + ' \\n'
                                role_msg = role_msg[0: len(role_msg) - 3]
                                content_msg = content_msg[0: len(content_msg) - 3]
                                param_value[key] = param_value[key].replace('${role}', role_msg)
                                param_value[key] = param_value[key].replace('${content}', content_msg)
                        elif message is not None and str(param['type']).lower() == 'jsonarray':
                            if isinstance(param_value, dict):
                                raise model_exception.PARAM_FORMAT_ERROR(10007, 'message param format error!')
                            param_msg = param_value[0]
                            param_msg_json = PMCommonUtil.object_to_json(param_msg)
                            msg_array = []
                            for msg in message:
                                param_msg = PMCommonUtil.json_to_dict(param_msg_json)
                                for key in list(param_msg.keys()):
                                    param_msg[key] = param_msg[key].replace('${role}', msg['role'])
                                    msg['content'] = PMBaseAIModel.escape_character(msg['content'])
                                    param_msg[key] = param_msg[key].replace('${content}', msg['content'])
                                    if not operator.contains(str(param_msg), '${role}') and not operator.contains(str(param_msg), '${content}'):
                                        msg_array.append(param_msg)
                            value = msg_array
                        else:
                            if isinstance(message, list):
                                for msg in message:
                                    msg['content'] = PMBaseAIModel.escape_character(msg['content'])
                                    value = value + msg['role'] + ' ' + msg['content'] + ' \\n'
                                value = value[0: len(value) - 3]
                            else:
                                value = str(message)
                else:
                    value = message
            if value and value != '':
                param_value = value
            if not isinstance(param_value, str):
                param_value = PMCommonUtil.object_to_json(param_value)
            if replace_result:
                if param_name == '${result}' and (str(param['type']).lower() == 'json' or str(param['type']).lower() == 'jsonarray'):
                    param_value = '\"${system_result}\"'
                if param_name == '${stream_result}' and (str(param['type']).lower() == 'json' or str(param['type']).lower() == 'jsonarray'):
                    param_value = '\"${system_stream_result}\"'
            if check_default_value and param_name != '${errorMessage}' and param_name != '${message}' and param_name != '${result}' and not default_value:
                raise model_exception.DEFAULT_VALUE_IS_REQUIRED()
            config = config.replace(param_name, param_value)

        config = config.replace('True', 'true')
        config = config.replace('False', 'false')
        config = config.replace('None', 'null')
        return json.loads(config)

    @staticmethod
    def escape_character(content):
        if not isinstance(content, str):
            return content
        content = content.replace('"', r'\"')
        content = content.replace('\\', '\\\\')
        content = content.replace('\n', '\\n')
        content = content.replace('\r', '\\r')
        content = content.replace('\t', '\\t')
        content = content.replace('\v', '\\v')
        content = content.replace('\f', '\\f')
        return content

    def replace_message_role(self, message):
        model_role = self._model_role
        for msg in message:
            role = msg['role']
            if role in model_role:
                msg['role'] = model_role[role]
        return message

    def request_result(self, requestBody, params):
        response = self.request(requestBody, params, True)
        stream = requestBody['stream'] if 'stream' in requestBody else False
        if stream:
            return response
        else:
            result = PMBaseAIModel.get_response_result(response, self._content_path)
            if not result:
                result = PMBaseAIModel.get_response_result(response, self._result_path)
            else:
                return result

            if not result:
                return response

    @staticmethod
    def get_response_path(responseBody, value):
        result_path = ''
        for path in PMCommonUtil.find_path(responseBody, value, []):
            result_path = path
        return result_path

    @staticmethod
    def  get_response_path_by_key(responseBody, key):
        result_path = ''
        for path in PMCommonUtil.find_path_by_key(responseBody, key, []):
            result_path = path
        return result_path

    @staticmethod
    def get_response_result(response, result_path):
        try:
            for key in result_path:
                response = response[key]
            return response
        except Exception as e:
            return None


class PMLLM(PMBaseAIModel):
    @staticmethod
    def load_from_config(config, params_define):
        return PMLLM(config, params_define)

    @staticmethod
    def load_from_path(path):
        with open(path, 'r') as file:
            content = json.load(file)
        config = content['config']
        params = content['params']
        return PMLLM.load_from_config(config, params)

    @staticmethod
    def get_model_path_dict(config, params_define):
        model_path_dict = {}
        config_content = PMLLM.get_param_config(config, params_define)

        #set content_path
        responseBody = PMCommonUtil.object_to_dict(config_content['responseBody'])
        content_path = PMBaseAIModel.get_response_path(responseBody, '${result_content}')
        model_path_dict['content_path'] = content_path

        #set error_messge_path
        if 'responseErrorBody' in config_content:
            responseErrorBody = PMCommonUtil.object_to_dict(config_content['responseErrorBody'])
            error_message_path = PMBaseAIModel.get_response_path(responseErrorBody, '${errorMessage}')
            model_path_dict['error_message_path'] = error_message_path

        #set result_path
        config_content_replace_result = PMLLM.get_param_config(config, params_define, replace_result=True)
        responseBody_replace_result = PMCommonUtil.object_to_dict(config_content_replace_result['responseBody'])
        result_path = PMBaseAIModel.get_response_path(responseBody_replace_result, '${system_result}')
        model_path_dict['result_path'] = result_path

        # set stream_content_path
        if 'responseStreamBody' in config_content:
            responseStreamBody = PMCommonUtil.object_to_dict(config_content['responseStreamBody'])
            stream_content_path = PMBaseAIModel.get_response_path(responseStreamBody, '${stream_content}')
            model_path_dict['stream_content_path'] = stream_content_path

        #set stream_result_path
        if 'responseStreamBody' in config_content_replace_result:
            responseStreamBody_replace_result = PMCommonUtil.object_to_dict(config_content_replace_result['responseStreamBody'])
            stream_result_path = PMBaseAIModel.get_response_path(responseStreamBody_replace_result, '${system_stream_result}')
            model_path_dict['stream_result_path'] = stream_result_path

        return model_path_dict

    @staticmethod
    def get_model_role(config, params_define):
        config_content = PMLLM.get_param_config(config, params_define)
        modelRole = PMCommonUtil.object_to_dict(config_content['modelRole'])
        return modelRole

    def request_by_message(self, message, params=None):
        config = self.config
        params_define = self.params_define
        message = PMBaseAIModel.replace_message_role(self, message)

        params_config = PMBaseAIModel.get_param_config(config, params_define, params, message, check_default_value=True, replace_message=True)
        url = params_config['url']
        header = params_config['header']
        requestBody = params_config['requestBody']

        response = self.request(requestBody, params)
        stream = requestBody['stream'] if 'stream' in requestBody else False
        if stream:
            return response
        else:
            result = PMBaseAIModel.get_response_result(response, self._result_path)
            if result:
                return result
            else:
                return response

    def request_result_by_message(self, message, params=None):
        message = PMBaseAIModel.replace_message_role(self, message)
        params_config = PMLLM.get_param_config(self.config, self.params_define, params, message, check_default_value=True, replace_message=True)
        requestBody = params_config['requestBody']
        response = PMBaseAIModel.request(self, requestBody, params, True)
        stream = requestBody['stream'] if 'stream' in requestBody else False
        if stream:
            return response
        else:
            result = PMBaseAIModel.get_response_result(response, self._content_path)
            if not result:
                result = PMBaseAIModel.get_response_result(response, self._result_path)
            else:
                return result

            if not result:
                return response


class PMOpenAIPMLLM(PMLLM):
    @staticmethod
    def load_from_openai_key(api_key):
        file_path = Path(__file__).resolve().parent.parent / 'model/default/openapi_model.conf'
        with open(file_path, 'r') as file:
            content = json.load(file)
        config = content['config']
        config = config.replace('${OPENAI_API_KEY}', api_key)
        params = content['params']
        return PMLLM(config, params)


class PMFakeLLM(PMLLM):
    def __init__(self, response):
        self.response = response
        pmLLM = PMFakeLLM.get_parent_field()
        self.config = pmLLM.config
        self.params_define = pmLLM.params_define
        self._content_path = pmLLM._content_path
        self._result_path = pmLLM._result_path
        self._error_messge_path = pmLLM._error_messge_path
        self._stream_result_path = pmLLM._stream_result_path
        self._stream_content_path = pmLLM._stream_content_path
        self._model_role = pmLLM._model_role

    @staticmethod
    def get_parent_field():
        file_path = Path(__file__).resolve().parent.parent / 'model/default/openapi_model.conf'
        with open(file_path, 'r') as file:
            content = json.load(file)
        config = content['config']
        config = config.replace('${OPENAI_API_KEY}', 'xxxxxx-xxxxxxxxxxxxxxxxxxxx')
        params = content['params']
        return PMLLM(config, params)

    def request(self, requestBody, params=None):
        config = self.config
        params_define = self.params_define

        params_config = PMBaseAIModel.get_param_config(config, params_define, params, check_default_value=True, replace_message=True)
        url = params_config['url']
        header = params_config['header']

        return PMFakeLLM.get_result(self.response)

    def request_by_message(self, message, params=None):
        config = self.config
        params_define = self.params_define
        message = PMBaseAIModel.replace_message_role(self, message)

        params_config = PMBaseAIModel.get_param_config(config, params_define, params, message, check_default_value=True, replace_message=True)
        url = params_config['url']
        header = params_config['header']
        requestBody = params_config['requestBody']

        return PMFakeLLM.get_result(self.response)

    def request_result_by_message(self, message, params=None):
        message = PMBaseAIModel.replace_message_role(self, message)
        params_config = PMLLM.get_param_config(self.config, self.params_define, params, message,
                                               check_default_value=True, replace_message=True)
        requestBody = params_config['requestBody']

        return PMFakeLLM.get_result(self.response)

    @staticmethod
    def get_result(response):
        result = ''
        for line in response:
            result = result + line + '\n'
        return result


class PMCustomLLM(PMLLM):
    pass