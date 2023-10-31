import json
import logging
import os
import traceback
from pathlib import Path
import subprocess

import docx
import pandas as pd

logger = logging.getLogger('pm_log')
class PMCommonUtil:

    @staticmethod
    def object_to_json(obj):
        json_str = json.dumps(obj, ensure_ascii=False, default=lambda obj: obj.__dict__)
        return json_str

    @staticmethod
    def object_to_dict(obj):
        json_str = json.dumps(obj, ensure_ascii=False, default=lambda obj: obj.__dict__)
        dict = json.loads(json_str)
        return dict

    @staticmethod
    def json_to_dict(json_str):
        dict = json.loads(json_str)
        return dict

    @staticmethod
    def convert_list_to_dict(to_convert_list: list) -> dict:
        result_dict = {}
        for param in to_convert_list:
            if isinstance(param, object):
                param = PMCommonUtil.object_to_dict(param)

            key = param['name'] if 'name' in param else param['variable']
            value = param['value'] if not PMCommonUtil.is_value_none("value", param) else param['defaultValue']

            result_dict[key] = value
        return result_dict

    @staticmethod
    def convert_dict_to_list(to_convert_dict: dict) -> list[dict]:
        result_list = []

        for k, v in to_convert_dict.items():
            item = {
                "name": k,
                "variable": k,
                "type": type(v).__name__ if type(v).__name__ != 'str' else "text",
                "value": v
            }
            result_list.append(item)

        return result_list

    @staticmethod
    def is_value_none(_key, _dict: dict) -> bool:
        if _key not in _dict:
            return True
        if _dict[_key] == '' or _dict[_key] is None:
            return True
        return False

    @staticmethod
    def json_to_dict(json_str):
        dict_result = json.loads(json_str)
        return dict_result

    @staticmethod
    def object_to_dict(obj):
        json_str = json.dumps(obj, ensure_ascii=False, default=lambda obj: obj.__dict__)
        dict = json.loads(json_str)
        return dict

    @staticmethod
    def find_path(root, target, path):
        """
        root: need find json
        target: target value
        path: find target value path
        """
        if isinstance(root, dict):
            for key, value in root.items():
                if value == target:
                    yield [key]
                else:
                    for path_part in PMCommonUtil.find_path(value, target, []):
                        yield [key] + path_part
        elif isinstance(root, list):
            for index, value in enumerate(root):
                if value == target:
                    yield [index]
                else:
                    for path_part in PMCommonUtil.find_path(value, target, []):
                        yield [index] + path_part

    @staticmethod
    def find_path_by_key(root, target_key, path):
        """
        root: need find json
        target: target value
        path: find target value path
        """
        if isinstance(root, dict):
            for key, value in root.items():
                if key == target_key:
                    yield [key]
                else:
                    for path_part in PMCommonUtil.find_path_by_key(value, target_key, []):
                        yield [key] + path_part
        elif isinstance(root, list):
            for index, value in enumerate(root):
                if index == target_key:
                    yield [index]
                else:
                    for path_part in PMCommonUtil.find_path_by_key(value, target_key, []):
                        yield [index] + path_part

    @staticmethod
    def generate_ios_by_variables(variables: list) -> list:
        ios = []
        for variable in variables:
            io = {
                "name": variable['name'],
                "type": variable['type'],
                "defaultValue": variable['defaultValue'],
                "value": variable['value'] if 'value' in variable else None
            }
            ios.append(io)

        return ios

    @staticmethod
    def generate_variables_by_ios(ios: list) -> list:
        variables = []
        for io in ios:
            variable = {
                "variable": io['name'],
                "type": io['type'],
                "defaultValue": io['defaultValue'],
                "value": io['value'] if 'value' in io else None
            }
            variables.append(variable)

        return variables

    @staticmethod
    def generate_io_output_key(node, output_name: str) -> str:
        return node.id + "_" + output_name

    @staticmethod
    def generate_io_output_key_by_edge(edge) -> str:
        return edge.source_node + "_" + edge.source_output_name

    @staticmethod
    def is_json(text):
        try:
            json.loads(text)
            return True
        except ValueError:
            return False


class FileUtil:
    @staticmethod
    def write(file_path, content: str):
        if not os.path.exists(file_path):
            parent_path = os.path.abspath(os.path.join(file_path, os.pardir))
            if not os.path.exists(parent_path):
                os.makedirs(parent_path)

        with open(file_path, "w",encoding='utf-8') as f:
            f.write(content)

    @staticmethod
    def read(file_path):
        content = None
        if os.path.exists(file_path):
            with open(file_path, "r",encoding='utf-8') as f:
                content = f.read()
        return content

    @staticmethod
    def delete_file(file_path):
        if os.path.exists(file_path):
            os.remove(file_path)

    @staticmethod
    def read_dox_file(file_path: str, file_suffix: str, length: int = None):
        content = ''
        try:
            docx_path = file_path
            if file_suffix == 'doc':
                #转换成docx文件
                file_name = os.path.basename(file_path)
                #获取fileName
                name = os.path.splitext(file_name)[0]
                dir_path = Path(file_path).parent
                FileUtil.save_doc_to_docx(file_path, dir_path)
                docx_path = os.path.join(dir_path, name + '.docx')
            file = docx.Document(docx_path)
            for p in file.paragraphs:
                content += p.text
            logger.info('read_dox_file=======content:' + content)
            #关闭文件
            file.save(docx_path)
            if file_suffix == 'doc':
                if os.path.exists(docx_path):
                    os.remove(docx_path)

            if length:
                return content[:length]
            else:
                return content
        except Exception :
            logger.error(traceback.format_exc())

    @staticmethod
    def read_excel_file(file_path: str, length: int = None):
        df = pd.read_excel(file_path)
        text = df.to_string(index=False)
        if length:
            return text[:length]
        else:
            return text

    @staticmethod
    def save_doc_to_docx(doc_path, docx_path):
        #需要在服务器安装libreoffice
        try:
            subprocess.run(
                ["soffice", "--headless", "--invisible", "--convert-to", "docx", f"{doc_path}", "--outdir", f"{docx_path}"])
        except Exception as e:
            logger.error(traceback.format_exc())

class PathUtil:

    @staticmethod
    def get_flow_base_path():
        if os.getenv('flow_base_path'):
            return Path(os.getenv('flow_base_path'))
        else:
            return Path(os.getcwd()) / 'flow'


if __name__ == '__main__':
    doc_path = 'E:/tmp/prompt/2023-09-11-11-25-15/内部升级方案梳理-20230615.doc'
    docx_path = 'E:/tmp/prompt/2023-09-11-11-25-15/'
    content = FileUtil.save_doc_to_docx(doc_path, docx_path)
    print(content)