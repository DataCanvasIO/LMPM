import importlib
import logging
import os
import time
import uuid
import importlib.util
from pathlib import Path
from promptmanager.runtime.common_util import PMCommonUtil, FileUtil, PathUtil
from promptmanager.runtime.enumeration.enum_flow_status import PMFlowStatus
from promptmanager.runtime.enumeration.enum_node_status import PMNodeStatus
from promptmanager.runtime.exception import flow_exception
from promptmanager.runtime.exception.base_exception import RuntimeException
from promptmanager.runtime.template import PMPromptTemplate

logger = logging.getLogger('pm_log')


class PMFlowNode:

    def __init__(self, id=None, name=None, module_id=None, module_name=None, module_type=None, left=None, top=None,
                 description=None, params=None, inputs=None, outputs=None):
        self.id = id
        self.name = name
        self.module_id = module_id
        self.module_name = module_name
        self.module_type = module_type
        self.left = left
        self.top = top
        self.description = description
        self.params = params
        self.inputs = inputs
        self.outputs = outputs

    def show_params(self):
        logger.info("this is node params of \"%s\":" % self.name)
        logger.info("node params: %s" % self.params)

    def show_io_info(self):
        logger.info("this is IOs of \"%s\":" % self.name)
        logger.info("inputs:%s" % self.inputs)
        logger.info("outputs:%s" % self.outputs)

    def show_info(self):
        logger.info("this is node info of \"%s\":" % self.name)
        logger.info("node info: %s" % PMCommonUtil.object_to_json(self))


class PMFlowInputNode(PMFlowNode):
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.name = "input"
        self.module_id = "00000000-0000-0000-0000-000000000001"
        self.module_name = "Input"
        self.module_type = "input"
        self.left = 125
        self.top = -159
        self.description = "The input node of flow is the beginning of the flow. User input will be sent to the flow from it."
        self.params = []
        self.inputs = []
        self.outputs = [{"name": "variable_assignment", "type": "any", "defaultValue": None, "value": None}]

    def _init_(self, **entries):
        self.__dict__.update(entries)

    def show_io_info(self):
        logger.info("this is IOs of \"%s\":" % self.name)
        logger.info("outputs:%s" % self.outputs)


class PMFlowOutputNode(PMFlowNode):
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.name = "output"
        self.module_id = "00000000-0000-0000-0000-000000000002"
        self.module_name = "Output"
        self.module_type = "output"
        self.left = 125
        self.top = 450
        self.description = "The output node of flow outputs the response from the large model."
        self.params = []
        self.inputs = [{"name": "result1", "type": "any", "defaultValue": None, "value": None}]
        self.outputs = []

    def _init_(self, **entries):
        self.__dict__.update(entries)

    def show_io_info(self):
        logger.info("this is IOs of \"%s\":" % self.name)
        logger.info("inputs:%s" % self.inputs)

    @staticmethod
    def create_output_node_last_input(old_last_input_name: str) -> dict:
        old_index_str = old_last_input_name.replace('result', '')
        new_index = int(old_index_str) + 1
        new_last_input_name = "result" + str(new_index)
        return {"name": new_last_input_name, "type": "any", "defaultValue": None, "value": None}


class PMFlowTemplateNode(PMFlowNode):
    def __init__(self, id=None, name=None, template: PMPromptTemplate = None, model=None, model_params_value=None,
                 **kwargs):
        super().__init__(kwargs)

        if id:
            self.id = id
        else:
            self.id = str(uuid.uuid4())

        if name:
            self.name = name
        self.params = {}
        if template:
            self._package_template_info(template)
        if model:
            self._package_model_info(model, model_params_value)

    def _package_template_info(self, template: PMPromptTemplate):
        if not self.name:
            self.name = template.name
        self.left = None
        self.top = None
        self.module_id = None
        self.module_name = template.name
        self.module_type = 'prompt'
        self.prompt = template.template_content

        role_list = [
            {
                "name": "roleName",
                "type": "",
                "options": [],
                "defaultValue": "",
                "value": template.role
            },
            {
                "name": "rolePrompt",
                "type": "",
                "options": [],
                "defaultValue": "",
                "value": template.role_prompt
            }
        ]

        variables = template._variables
        if isinstance(variables, str):
            variables = PMCommonUtil.json_to_dict(variables)
        params = {
            "prompt": template.template_content,
            "variables": variables,
            "role": role_list,
        }
        if self.params:
            self.params.update(params)
        else:
            self.params = params
        self.inputs = PMCommonUtil.generate_ios_by_variables(variables)
        self.outputs = [{
            "name": "output",
            "type": "text",
            "defaultValue": "",
            "value": ""
        }]

    def _package_model_info(self, model, model_params_value):
        if isinstance(model, object):
            model = PMCommonUtil.object_to_dict(model)

        if isinstance(model_params_value, dict):
            params = PMCommonUtil.convert_dict_to_list(model_params_value)
        else:
            params = model_params_value

        model_config = {
            "name": "model_config",
            "type": "text",
            "value": model['config']

        }
        model_define_dict = PMCommonUtil.object_to_dict(model['params_define'])
        model_param_define = {
            "name": "model_param_define",
            "type": "dict",
            "value": model_define_dict
        }
        for model_param in params:
            if model_param['name'] == 'stream':
                model_param['value'] = "False"

        params.append(model_config)
        params.append(model_param_define)

        self.params['model'] = params

    def _init_(self, **entries):
        self.__dict__.update(entries)
        # remove_none_value_model_params
        self.remove_none_value_model_params()

    def remove_none_value_model_params(self):
        new_model_params = []
        for model_param in self.params['model']:
            if not PMCommonUtil.is_value_none("value", model_param):
                if model_param['name'] == 'stream':
                    model_param['value'] = "False"
                new_model_params.append(model_param)
        self.params['model'] = new_model_params

    def get_script_module_info(self, flow_id=None):
        module_name = "define_prompt"
        module_path = Path(__file__).resolve().parent.parent / "script/prompt_runner.py"
        return module_name, module_path

    @staticmethod
    def from_template(name=None, template: PMPromptTemplate = None, model=None, model_params_value=None):
        if not model_params_value:
            model_params_value = {}
        if isinstance(model_params_value, dict):
            model_params_value['stream'] = False
        elif isinstance(model_params_value, list):
            stream = {
                "name": 'stream',
                "variable": 'stream',
                "type": 'bool',
                "value": 'False'
            }
            model_params_value.append(stream)

        return PMFlowTemplateNode(name=name, template=template, model=model, model_params_value=model_params_value)


class PMFlowScriptNode(PMFlowNode):

    def __init__(self, id=None, name=None, path=None, module_id=None, module_name=None, module_type=None,
                 description=None, params=None, inputs=None, outputs=None, **kwargs):
        super().__init__(kwargs)

        if outputs is None:
            outputs = []
        if inputs is None:
            inputs = []
        if params is None:
            params = []
        if id:
            self.id = id
        else:
            self.id = str(uuid.uuid4())

        if name:
            self.name = name

        self.module_id = module_id

        self.module_name = module_name

        if module_type:
            self.module_type = module_type
        else:
            self.module_type = "script"

        self.left = None
        self.top = None
        self.description = description
        self.inputs = inputs
        self.outputs = outputs

        if params:
            self.params = {
                "script": params
            }
            path = None
            for param in params:
                if param['name'] == 'script':
                    path = param['value']
                    break
            self.script_path = path
        else:
            self.script_path = path
            self.params = {
                "script": [
                    {
                        "name": "script",
                        "type": "text",
                        "default_value": path,
                        "value": path
                    }
                ]
            }

    def _init_(self, **entries):
        self.__dict__.update(entries)

    def add_input(self, input):
        inputs = [input]
        self.add_inputs(inputs)

    def add_inputs(self, inputs: list):
        if not self.inputs:
            self.inputs = inputs
            return

        new_inputs = []
        new_input_dict = {}
        for input in inputs:
            new_input_dict[input['name']] = input
            new_inputs.append(input)

        for old_input in self.inputs:
            if not old_input['name'] in new_input_dict:
                new_inputs.append(old_input)

        self.inputs = new_inputs

    def add_output(self, output):
        outputs = [output]
        self.add_outputs(outputs)

    def add_outputs(self, outputs: list):
        if not self.outputs:
            self.outputs = outputs
            return

        new_outputs = []
        new_output_dict = {}
        for output in outputs:
            new_output_dict[output['name']] = output
            new_outputs.append(output)

        for old_output in self.outputs:
            if not old_output['name'] in new_output_dict:
                new_outputs.append(old_output)

        self.outputs = new_outputs

    def get_script_path(self):
        for script_param in self.params['script']:
            if script_param['name'] == 'script':
                return script_param['value'], script_param['path_type'] if 'path_type' in script_param else None

    def get_script_module_info(self, flow_id):
        module_path, path_type = self.get_script_path()

        if module_path.startswith('/'):
            module_path = module_path.replace('/', '', 1)
        elif module_path.startswith('\\'):
            module_path = module_path.replace('\\', '', 1)

        if path_type == 'relative':
            relative_path = flow_id + '/' + module_path
            module_path = PathUtil.get_flow_base_path() / relative_path

        file_name = os.path.basename(module_path)
        module_name = file_name.replace(".py", "")

        return module_name, module_path


class PMFlowEdge(object):
    source_node = None
    source_output_name = None
    target_node = None
    target_input_name = None

    def __init__(self, source_node=None, source_output_name=None, target_node=None, target_input_name=None):
        if source_node:
            self.source_node = source_node.id
        self.source_output_name = source_output_name
        if target_node:
            self.target_node = target_node.id
        self.target_input_name = target_input_name

    def _init_(self, **entries):
        self.__dict__.update(entries)

    @staticmethod
    def load_by_edge(edge_info):
        edge = PMFlowEdge()
        edge._init_(**edge_info)
        return edge

    def show_info(self):
        logger.info("this is edge info:")
        logger.info("edge info:" + PMCommonUtil.object_to_json(self))


class PMNodeOutput(object):
    def __init__(self):
        self.output_dict={}

    def add_output(self, output_name, output_value):
        self.output_dict[output_name] = output_value

    def get_outputs(self) -> dict:
        return self.output_dict


class PMFlow(object):
    def __init__(self, id=None, name=None, nodes=None, edges=None, params=None):
        if edges is None:
            edges = []
        if nodes is None:
            nodes = []
        if params is None:
            params = []
        if id:
            self.id = id
        else:
            self.id = str(uuid.uuid4())
        self.name = name
        self.params = params

        self._init_nodes(nodes)
        self._init_edges(edges)

        self.flow_result = PMFlowResult()

    def _init_nodes(self, nodes=None):
        # if nodes empty,add input and output node
        if not nodes:
            self.nodes = [PMFlowInputNode(), PMFlowOutputNode()]
        else:
            new_nodes = []
            for node in nodes:
                new_node = None
                if isinstance(node, dict):
                    if node['module_type'] == "input":
                        new_node = PMFlowInputNode()
                    elif node['module_type'] == "output":
                        new_node = PMFlowOutputNode()
                    elif node['module_type'] == "prompt":
                        new_node = PMFlowTemplateNode()
                    else:
                        new_node = PMFlowScriptNode()
                new_node._init_(**node)
                new_nodes.append(new_node)
            self.nodes = new_nodes

    def _init_edges(self, edges=None):
        if not edges:
            self.edges = []
        else:
            new_edges = []
            for edge in edges:
                new_edge = PMFlowEdge()
                new_edge._init_(**edge)
                new_edges.append(new_edge)
            self.edges = new_edges

    def show_variables(self):
        logger.info("this is the flow variables of \"%s\":" % self.name)
        variables_str = "[]"
        if self.params:
            variables_str = PMCommonUtil.object_to_json(self.params)
        logger.info("variables:%s" % variables_str)

    def show_info(self):
        logger.info("this is the flow info of \"%s\":" % self.name)
        logger.info("info: %s" % PMCommonUtil.object_to_json(self))

    def get_input_node(self):
        for node in self.nodes:
            if node.module_type == "input":
                return node
        return None

    def get_output_node(self):
        for node in self.nodes:
            if node.module_type == "output":
                return node
        return None

    def add_node(self, node):
        self.nodes.append(node)

    def add_edge(self, source_node, source_node_output_name, target_node, target_node_input_name):
        edge = PMFlowEdge(source_node=source_node, source_output_name=source_node_output_name,
                          target_node=target_node, target_input_name=target_node_input_name)
        PMFlow.__check_edge_validity(edge, self.nodes)
        self.edges.append(edge)

        if source_node.module_type == "input":
            self.__add_input_node_params(source_node, target_node, target_node_input_name)
        if target_node.module_type == 'output':
            self.__add_output_node_inputs(target_node)

    def __add_input_node_params(self, input_node, target_node, target_node_input_name):
        # self nodes delete input node
        self.nodes.remove(input_node)

        # create new input node
        target_variables = PMCommonUtil.generate_variables_by_ios(target_node.inputs)
        new_variable = {}
        for target_variable in target_variables:
            if target_variable['variable'] == target_node_input_name:
                new_variable = target_variable
                break

        input_params = []
        input_params.extend(input_node.params)

        update_flag = True
        for input_param in input_params:
            if input_param['variable'] == new_variable['variable'] and input_param['type'] == new_variable['type']:
                update_flag = False
                break

        if update_flag:
            input_params.append(new_variable)

        input_node.params = input_params
        self.params = input_params

        # self nodes add new  input node
        self.nodes.insert(0, input_node)

    def __add_output_node_inputs(self, output_node):
        # self nodes delete output node
        self.nodes.remove(output_node)

        # create new input node
        output_node_inputs = []
        output_node_inputs.extend(output_node.inputs)

        last_input = output_node_inputs[-1:][0]
        new_last_input = PMFlowOutputNode.create_output_node_last_input(last_input['name'])

        output_node_inputs.append(new_last_input)
        output_node.inputs = output_node_inputs

        # self nodes add new output node
        self.nodes.append(output_node)

    def remove_edge(self, source_node, source_node_output_name, target_node, target_node_input_name):
        edge = PMFlowEdge(source_node=source_node, source_output_name=source_node_output_name,
                          target_node=target_node, target_input_name=target_node_input_name)
        self.edges.remove(edge)

        if source_node['module_type'] == "input":
            self.__regenerate_input_node_params()
        if target_node['module_type'] == 'output':
            self.__delete_output_node_inputs(target_node, target_node_input_name)

    def __regenerate_input_node_params(self):
        input_params = PMFlow.get_flow_input_params(self.nodes, self.edges)
        self.params = input_params

    @staticmethod
    def get_flow_input_params(nodes, edges):
        # 1.find inputNode
        input_node = None
        node_dict = {}
        for node in nodes:
            node_dict[node['id']] = node
            if node['module_type'] == 'input':
                input_node = node
        if not input_node:
            raise flow_exception.FLOW_INPUT_NOT_EXIST

        # 2.find all edges which source_node is inputNode
        direct_connect_edges = []
        for edge in edges:
            if edge['source_node'] == input_node['id']:
                direct_connect_edges.append(edge)

        # 3.use edges above to find all nodes which connects inputNode directly
        params = []
        for direct_connect_edge in direct_connect_edges:
            target_node = node_dict[direct_connect_edge['target_node']]
            prompt_variables = target_node['inputs']
            target_input = None
            for prompt_variable in prompt_variables:
                if prompt_variable['name'] == direct_connect_edge['target_input_name']:
                    target_input = prompt_variable
                    break

            if not target_input:
                raise flow_exception.FLOW_TARGET_NODE_INPUT_NOT_MATCH

            new_variable = {
                "variable": target_input['name'],
                "type": target_input['type'],
                "defaultValue": target_input['defaultValue'] if 'defaultValue' in target_input else ""
            }
            if params:
                add_flag = True
                for param in params:
                    if param['variable'] == new_variable['variable'] and param['type'] == new_variable['type']:
                        add_flag = False
                        break
                if add_flag:
                    params.append(new_variable)

            else:
                params.append(new_variable)

        # set inputNode params
        input_node['params'] = params
        return params

    def __delete_output_node_inputs(self, output_node, target_node_input_name):
        # self nodes delete output node
        self.nodes.remove(output_node)

        # delete output_node inputs and create new output node
        output_node_inputs = []
        output_node_inputs.extend(output_node['inputs'])

        to_remove_input = {"name": target_node_input_name, "type": "any", "defaultValue": None, "value": None}
        output_node_inputs.remove(to_remove_input)

        output_node['inputs'] = output_node_inputs

        # self nodes add new output node
        self.nodes.append(output_node)

    @staticmethod
    def __check_edge_validity(edge, nodes):
        source_node_pass = False
        target_node_pass = False
        for node in nodes:
            if node.id == edge.source_node:
                for output in node.outputs:
                    if output['name'] == edge.source_output_name:
                        source_node_pass = True
                        break
            elif node.id == edge.target_node:
                for input in node.inputs:
                    if input['name'] == edge.target_input_name:
                        target_node_pass = True
                        break
            else:
                pass
        if not (source_node_pass and target_node_pass):
            logger.error("edge info is illegal!!!")
            raise flow_exception.ILLEGAL_EDGE_INFO()

    def save(self, save_path):
        flow_json = PMCommonUtil.object_to_json(self)
        FileUtil.write(save_path, flow_json)

    def run(self, variables, run_async=True):
        # if variables is list ,convert to dict
        if isinstance(variables, dict):
            variables = PMCommonUtil.convert_dict_to_list(variables)

        # check input: input node outputs must have edge
        self.check_input_node(self.nodes, self.edges)

        # check variables
        self.check_run_variables(self.params, variables)

        if run_async:
            import threading
            run_thread = threading.Thread(target=self._do_run, args=(variables,))
            run_thread.setDaemon(True)
            run_thread.start()
        else:
            self._do_run(variables)

    def _do_run(self, variables):
        try:
            # if variables is list ,convert to dict
            if isinstance(variables, dict):
                variables = PMCommonUtil.convert_dict_to_list(variables)

            # set flow result
            self.flow_result = PMFlowResult(flow_id=self.id, flow_name=self.name, start_time=time.time(),
                                            status=PMFlowStatus.RUNNING.name)
            # write flow result
            self.write_flow_result()

            # run nodes
            self.run_nodes(variables)
            # update final result
            self.flow_result.end_time = time.time()
            self.flow_result.status = PMFlowStatus.SUCCESS.name
            self.write_flow_result()
        except Exception as e:
            self.flow_result.end_time = time.time()
            self.flow_result.status = PMFlowStatus.FAILED.name
            self.write_flow_result()
            raise e

    def __set_node_status(self, node_id, status, error_msg=None):
        nodes_info = self.flow_result.nodes_info
        for node_info in nodes_info:
            if node_info.node_id == node_id:
                node_info.status = status
                node_info.error_msg = error_msg
                if status == PMNodeStatus.SUCCESS.name or status == PMNodeStatus.FAILED.name:
                    node_info.end_time = time.time()
                break
        self.write_flow_result()

    def __get_node_status(self, node_id):
        nodes_info = self.flow_result.nodes_info
        for node_info in nodes_info:
            if node_info.node_id == node_id:
                return node_info.status
        return None

    def run_nodes(self, variables: list[dict]):
        node_output_dict = {}
        nodes_info = self.flow_result.nodes_info
        # input_node_info = None
        # output_node_info = None
        # for node in self.nodes:
        #     node_info = PMFlowNodeRunningInfo(node_id=node.id, node_name=node.name, start_time=time.time(),
        #                                       status=PMNodeStatus.QUEUED.name)
        #     if node.module_type == 'input':
        #         input_node = node
        #         input_node_info = node_info
        #     elif node.module_type == 'output':
        #         output_node_info = node_info
        #     else:
        #         nodes_info.append(node_info)
        # nodes_info.insert(0, input_node_info)
        # nodes_info.insert(len(self.nodes) - 1, output_node_info)
        input_node_info = None
        input_node = None
        for node in self.nodes:
            if node.module_type == 'input':
                input_node = node
                input_node_info = PMFlowNodeRunningInfo(node_id=node.id, node_name=node.name, start_time=time.time(),
                                                        status=PMNodeStatus.QUEUED.name)
                break
        if not input_node:
            raise flow_exception.FLOW_INPUT_NOT_EXIST
        nodes_info.append(input_node_info)
        # create input_node outputs
        self.create_input_node_outputs(input_node, variables, node_output_dict)
        self.__set_node_status(input_node.id, PMNodeStatus.SUCCESS.name)

        self._run_node_down(input_node, node_output_dict)

    def _run_node_down(self, current_node, node_output_dict: dict):
        for current_edge in self.edges:
            if current_edge.source_node == current_node.id:
                # find target node
                target_node = self.find_node_by_id(current_edge.target_node)
                # run node
                if not self.__get_node_status(target_node.id) or self.__get_node_status(
                        target_node.id) == PMNodeStatus.QUEUED.name:
                    self._run_node(target_node, node_output_dict, current_edge)
                    # run next node
                    self._run_node_down(target_node, node_output_dict)

    def _run_node(self, current_node, node_output_dict: dict, except_edge: dict = None):
        # find all edges which target node is target_node except current edge
        all_other_edges = self.find_node_all_input_edge(node=current_node, except_edge=except_edge)
        if all_other_edges:
            for other_edge in all_other_edges:

                if self.__is_node_input_node(other_edge.source_node):
                    # if source node is input node,then output_key = edge.source_node + "_" + edge.target_output_name
                    other_edge_source_output_key = other_edge.source_node + "_" + other_edge.target_input_name
                else:
                    # if source node is other node,then output_key = edge.source_node + "_" + edge.source_output_name
                    other_edge_source_output_key = PMCommonUtil.generate_io_output_key_by_edge(other_edge)

                if other_edge_source_output_key not in node_output_dict:
                    # if other_edge output is not ready,run other_edge source node
                    other_edge_source_node = self.find_node_by_id(other_edge.source_node)
                    self._run_node(other_edge_source_node, node_output_dict, None)

        node_info = PMFlowNodeRunningInfo(node_id=current_node.id, node_name=current_node.name, start_time=time.time(),
                                          status=PMNodeStatus.QUEUED.name)
        self.flow_result.nodes_info.append(node_info)

        # run and package result
        if not self.__is_node_output_node(current_node):
            run_result = self.create_pmruntime_and_run(current_node, node_output_dict)
            self.package_node_output(current_node, run_result, node_output_dict)
            self.__set_node_status(current_node.id, PMNodeStatus.SUCCESS.name)
        else:
            # write output result to file and save in node_output_dict
            self.run_output_node(current_node, node_output_dict)

    def find_node_by_id(self, id):
        for node in self.nodes:
            if node.id == id:
                return node
        raise flow_exception.Flow_NODE_NOT_EXIST

    def __is_node_input_node(self, source_node_id):
        source_node = self.find_node_by_id(source_node_id)
        if source_node.module_type == 'input':
            return True
        else:
            return False

    def __is_node_output_node(self, node):
        if node.module_type == 'output':
            return True
        else:
            return False

    def find_node_all_input_edge(self, node, except_edge: dict = None) -> list:
        result_list = []
        for edge in self.edges:
            if except_edge:
                if edge.target_node == node.id and edge != except_edge:
                    result_list.append(edge)
            else:
                if edge.target_node == node.id:
                    result_list.append(edge)
        return result_list

    def create_pmruntime_and_run(self, node, node_output_dict) -> PMNodeOutput:
        try:

            self.__set_node_status(node.id, PMNodeStatus.RUNNING.name)

            # package node inputs value and generate runtime
            all_input_edges = self.find_node_all_input_edge(node)
            input_name_value_mapping = {}
            for input_edge in all_input_edges:

                if self.__is_node_input_node(input_edge.source_node):
                    # if source node is input node,then output_key = edge.source_node + "_" + edge.target_output_name
                    output_key = input_edge.source_node + "_" + input_edge.target_input_name
                else:
                    # if source node is input node,then output_key = edge.source_node + "_" + edge.target_output_name
                    output_key = PMCommonUtil.generate_io_output_key_by_edge(input_edge)

                input_name_value_mapping[input_edge.target_input_name] = node_output_dict[output_key]

            for _input in node.inputs:
                if _input['name'] in input_name_value_mapping:
                    _input['value'] = input_name_value_mapping[_input['name']]

            runtime = PMRuntime(node.params, node.inputs, node.outputs)

            # import script to run
            module_name, module_path = node.get_script_module_info(self.id)

            spec = importlib.util.spec_from_file_location(module_name, module_path)

            runner = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(runner)

            return runner.run(runtime.params, runtime.inputs, runtime.outputs)
        except RuntimeException as re:
            import traceback
            logger.error(traceback.format_exc())
            self.__set_node_status(node_id=node.id, status=PMNodeStatus.FAILED.name, error_msg=re.message)
            raise re
        except Exception as e:
            import traceback
            logger.error(traceback.format_exc())
            self.__set_node_status(node_id=node.id, status=PMNodeStatus.FAILED.name, error_msg=traceback.format_exc())
            raise e

    def generate_flow_result_path(self):
        return PathUtil.get_flow_base_path() / ("%s/flow_running.info" % self.id)

    def generate_flow_output_path(self):
        return PathUtil.get_flow_base_path() / ("%s/output.result" % self.id)

    def write_flow_result(self):
        file_path = self.generate_flow_result_path()
        flow_result = self.flow_result
        to_save_result = PMFlowResult(flow_id=flow_result.flow_id, flow_name=flow_result.flow_name,
                                      start_time=flow_result.start_time, end_time=flow_result.end_time,
                                      status=flow_result.status, nodes_info=flow_result.nodes_info)

        to_save_outputs = []
        flow_outputs = flow_result.outputs
        for flow_output in flow_outputs:
            try:
                value = flow_output['value'] if isinstance(flow_output['value'], str) else "\n\n".join(
                    flow_output['value'])
                support_view = True
            except Exception as e:
                value = "Preview is not supported for the result."
                support_view = False

            to_save_output = {
                "name": flow_output['name'],
                "type": flow_output['type'],
                "value": value,
                "supportView": support_view
            }
            to_save_outputs.append(to_save_output)

        to_save_result.outputs = to_save_outputs
        FileUtil.write(file_path, PMCommonUtil.object_to_json(to_save_result))

    @staticmethod
    def package_node_output(node, run_result: PMNodeOutput, node_output_dict: dict):
        outputs_result = run_result.get_outputs()
        for output in node.outputs:
            output_name = output['name']
            output_key = PMCommonUtil.generate_io_output_key(node, output_name)
            node_output_dict[output_key] = outputs_result[output_name]

    def run_output_node(self, node, node_output_dict: dict):
        try:
            self.__set_node_status(node.id, PMNodeStatus.RUNNING.name)

            all_input_edges = self.find_node_all_input_edge(node)
            input_name_value_mapping = {}

            for input_edge in all_input_edges:
                if self.__is_node_input_node(input_edge.source_node):
                    # if source node is input node,then output_key = edge.source_node + "_" + edge.target_output_name
                    output_key = input_edge.source_node + "_" + input_edge.target_input_name
                else:
                    # if source node is input node,then output_key = edge.source_node + "_" + edge.target_output_name
                    output_key = PMCommonUtil.generate_io_output_key_by_edge(input_edge)

                input_name_value_mapping[input_edge.target_input_name] = node_output_dict[output_key]

            to_write_output_dict = {}
            node_inputs = node.inputs

            for _input in node_inputs:
                _input['value'] = input_name_value_mapping[_input['name']] if _input[
                                                                                  'name'] in input_name_value_mapping else None

                to_write_output_dict[_input['name']] = _input['value']

            # write to file
            # output_result_path = PathUtil.get_flow_base_path() / ("%s/output.result" % self.id)
            # FileUtil.write(output_result_path, PMCommonUtil.object_to_json(to_write_output_dict))

            self.flow_result.end_time = time.time()
            self.flow_result.status = PMFlowStatus.SUCCESS.name
            output_inputs = []
            for i in range(0, node.inputs.__len__() - 1):
                output_inputs.append(node.inputs[i])
            self.flow_result.outputs = output_inputs

            self.__set_node_status(node.id, PMNodeStatus.SUCCESS.name)
        except RuntimeException as re:
            import traceback
            logger.error(traceback.format_exc())
            self.__set_node_status(node_id=node.id, status=PMNodeStatus.FAILED.name, error_msg=re.message)
            raise re
        except Exception as e:
            import traceback
            logger.error(traceback.format_exc())
            self.__set_node_status(node_id=node.id, status=PMNodeStatus.FAILED.name, error_msg=traceback.format_exc())
            raise e

    @staticmethod
    def create_input_node_outputs(input_node, variables: list[dict], node_output_dict: dict):
        variable_dict = {}
        for variable in variables:
            variable_dict[variable['variable'] + '_' + variable['type']] = variable['value']

        for param in input_node.params:
            key = param['variable'] + "_" + param['type']
            if key in variable_dict:
                value = variable_dict[key]
            else:
                value = param['defaultValue']

            # if param['type'] == 'file':
            #     # read file
            #     value = PMPromptTemplate.getFileContent(value)

            io_output_key = PMCommonUtil.generate_io_output_key(input_node, param['variable'])
            node_output_dict[io_output_key] = value

    @staticmethod
    def check_input_node(nodes, edges):
        # check input exists
        input_node = None
        for node in nodes:
            if node.module_type == 'input':
                input_node = node
                break
        if not input_node:
            raise flow_exception.FLOW_INPUT_NOT_EXIST

        # check input exists edges
        exists_edge = False
        for edge in edges:
            if edge.source_node == input_node.id:
                exists_edge = True
                break
        if not exists_edge:
            raise flow_exception.FLOW_INPUT_NODE_CONNCTS_NO_EDGE

    @staticmethod
    def check_run_variables(params: list, variables: list[dict]):
        variable_dict = {}
        for variable in variables:
            variable_dict[variable['variable']] = variable

        is_pass = True
        illegal_variables = []
        if params:
            for param in params:
                param_name = param['variable']
                if param_name not in variable_dict and PMCommonUtil.is_value_none('defaultValue', param):
                    is_pass = False
                    illegal_variables.append(param_name)
                elif param_name in variable_dict and param['type'] != variable_dict[param_name]['type']:
                    is_pass = False
                    illegal_variables.append(param_name)
                else:
                    pass
        if not is_pass:
            logger.error("params:%s type or value is illegal!!!" % PMCommonUtil.object_to_json(illegal_variables))
            raise flow_exception.FLOW_RUN_VARIABLES_ILLEGAL

    def get_result(self, output_name=None, wait_finish=True):
        while wait_finish and (
                self.flow_result.status != PMFlowStatus.SUCCESS.name and self.flow_result.status != PMFlowStatus.FAILED.name):
            # running_node = None
            # for node in self.flow_result.nodes_info:
            #     if node.status == PMNodeStatus.RUNNING.name:
            #         running_node = node
            #         break
            # if running_node:
            #     logger.info(
            #         "flow is running,current running node is [%s] , please wait for finished..." % running_node.node_name)
            # else:
            #     logger.info("flow is running, please wait for finished..." )
            logger.info("flow is running, please wait for finished...")
            time.sleep(1)

        flow_outputs = self.flow_result.get_outputs()
        if output_name:
            return flow_outputs.get(output_name, None)
        else:
            return flow_outputs

    def show_result(self, output_name=None, wait_finish=True):
        flow_result = self.get_result(output_name, wait_finish)
        logger.info("This is flow [%s] result:" % self.name)
        logger.info(flow_result)

    @staticmethod
    def load(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        flow_dict = PMCommonUtil.json_to_dict(content)
        if not PMCommonUtil.is_value_none("config", flow_dict):
            config = flow_dict['config']
            if isinstance(config, str):
                config = PMCommonUtil.json_to_dict(flow_dict['config'])
            edges = config['edges']
            nodes = config['nodes']
        else:
            edges = flow_dict['edges']
            nodes = flow_dict['nodes']

        params = PMFlow.get_flow_input_params(nodes=nodes, edges=edges)
        pmflow = PMFlow(name=flow_dict['name'], nodes=nodes, edges=edges, params=params)
        return pmflow


class PMFlowNodeRunningInfo(object):
    def __init__(self, node_id, node_name, start_time=None, end_time=None, status=None, error_msg=None):
        self.node_id = node_id
        self.node_name = node_name
        self.start_time = start_time
        self.end_time = end_time
        self.status = status
        self.error_msg = error_msg


class PMFlowResult(object):
    def __init__(self, flow_id=None, flow_name=None, start_time=None, end_time=None, status=None,
                 nodes_info=None, outputs=None):
        if outputs is None:
            outputs = []
        if nodes_info is None:
            nodes_info = []
        self.flow_id = flow_id
        self.flow_name = flow_name
        self.start_time = start_time
        self.end_time = end_time
        self.status = status
        self.nodes_info = nodes_info
        self.outputs = outputs

    def get_outputs(self):
        output_dict = {}
        for output in self.outputs:
            output_dict[output['name']] = output['value']
        return output_dict


class PMNodeOutput(object):
    def __init__(self):
        self.output_dict = {}

    def add_output(self, output_name, output_value):
        self.output_dict[output_name] = output_value

    def get_outputs(self):
        return self.output_dict


class PMRuntime(object):

    def __init__(self, params=[], inputs=[], outputs=[]):
        self.__params_info = params
        self.__inputs_info = inputs
        self.__outputs_info = outputs

        self.params = PMRuntime.build_params(params)
        self.inputs = PMRuntime.build_io(inputs)
        self.outputs = PMRuntime.build_io(outputs)

    @staticmethod
    def build_params(params):
        io_dict = {}
        for k, v in params.items():
            if isinstance(v, list):
                v = PMRuntime.build_io(v)
            io_dict[k] = v
        return io_dict

    @staticmethod
    def build_io(ios):
        io_dict = {}
        for value in ios:
            if isinstance(value, list):
                value = PMRuntime.build_io(value)
            io_dict[value['name']] = value
        return io_dict

    def show_info(self):
        logger.info("this is runtime info:")

        params_str = PMCommonUtil.object_to_json(self.__params_info) if self.__params_info else "[]"
        logger.info("params:---> " + params_str)

        inputs_str = PMCommonUtil.object_to_json(self.__inputs_info) if self.__inputs_info else "[]"
        logger.info("inputs:---> " + inputs_str)

        outpus_str = PMCommonUtil.object_to_json(self.__outputs_info) if self.__outputs_info else "[]"
        logger.info("outputs:---> " + outpus_str)

    # def reload(self, params, inputs, outputs):
    #     self.params = self._build_param("params", params)
    #     self.inputs = self._build_ios("inputs", inputs)
    #     self.outputs = self._build_ios("outputs", outputs)

    # @staticmethod
    # def _build_param(name, params):
    #     param_items = {}
    #     print(type(params))
    #     if isinstance(params, list):
    #         params = PMCommonUtil.convert_list_to_dict(params)
    #
    #     for k, v in params.items():
    #         if isinstance(v, list):
    #             v = PMRuntime._build_param(k, v)
    #         param_items[k] = v
    #     params = namedtuple(name, param_items.keys())
    #     return params(**param_items)
    #
    # @staticmethod
    # def _build_ios(name, ios):
    #     # return ios
    #     io_dict = {}
    #
    #     if isinstance(ios, list):
    #         ios = PMCommonUtil.convert_list_to_dict(ios)
    #
    #     for k, v in ios.items():
    #         if isinstance(v, list):
    #             v = PMRuntime._build_param(k, v)
    #         io_dict[k] = v
    #     params = namedtuple(name, io_dict.keys())
    #     return params(**io_dict)
