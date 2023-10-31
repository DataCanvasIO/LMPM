# Prompt Flow

To achieve complex business logic; I can build a workflow of the Prompt engineering to achieve a more complex and more practical business logic based workflow interacting with LLM;

## PMFlow

The prompt manager flow Object ,It contains PMNode and PMEdge

## PMNode

The prompt flow node Object,It contains name ,type, params, inputs and ouputs

## PMEdge

The prompt flow edge Object,It describe the connection from one node's input to another node's output

## Define Flow

```python
import threading

from promptmanager.runtime.model import PMLLM
from promptmanager.runtime.flow import PMFlow

if __name__ == '__main__':
    from promptmanager.runtime.flow import PMFlow

    # Step 1 init new PMFlow
    pm_flow = PMFlow(name="flow_name")

    # Step 2 get input_node and output_node
    input_node = pm_flow.get_input_node()
    output_node = pm_flow.get_output_node()

    input_node.show_io_info()
    # $>INFO: this is IOs of "input"::
    # $>INFO: outputs:[{'name': 'variable_assignment', 'type': 'any', 'defaultValue': None, 'value': None}]

    output_node.show_io_info()
    # $>INFO: this is IOs of "output":
    # $>INFO: inputs:[{'name': 'result1', 'type': 'any', 'defaultValue': None, 'value': None}]

    # Step 3 define a prompt node
    from promptmanager.runtime.flow import PMFlowTemplateNode
    from promptmanager.runtime.template import PMPromptTemplate

    template_content = """
    I want you act a famous novelist,
    I want to write a science fiction,
        The title is ${title} and number of words require ${number}.
    """
    role_name = "famous novelist"
    prompt_tempalte = PMPromptTemplate(template_content=template_content, role_prompt=role_name)

    openai_llm = PMLLM.load_from_path(path="../model/config.json")
    openai_llm.show_params_info()
    model_param_value = {
        "OPENAI_API_KEY": "xxxxxx-xxxxxxxxxxxxxxxxxxxx"
    }
    pm_template_node = PMFlowTemplateNode.from_template(name="prompt_tempalte_node", template=prompt_tempalte,
                                                        model=openai_llm, model_params_value=model_param_value)

    pm_template_node.show_io_info()
    # $>INFO: this is IOs of "prompt_tempalte_node":
    # $>INFO: inputs:[{'name': 'title', 'type': 'text', 'defaultValue': '', 'value': None}, {'name': 'number', 'type': 'text', 'defaultValue': '', 'value': None}]
    # $>INFO: outputs:[{'name': 'output', 'type': 'text', 'defaultValue': '', 'value': ''}]

    pm_template_node.show_info()
    # $>INFO: this is node info of "prompt_tempalte_node":
    # $>INFO: node info: {"id": "14e7709a-afd7-4eae-a100-ffa92d9cc6d5", "name": "prompt_tempalte_node", "module_id": null, "module_name": null, "module_type": "prompt", "left": null, "top": null, "description": null, "params": [{"name": "OPENAI_API_KEY", "type": "string", "defaultValue": "password", "value": "password"}, {"name": "model", "type": "select", "defaultValue": "gpt-3.5-turbo,gpt-4.0", "value": "gpt-3.5-turbo,gpt-4.0"}, {"name": "message", "type": "jsonarray", "defaultValue": null, "value": "[{\"role\": \"${role}\", \"content\": \"${content}\"}]"}, {"name": "temperature", "type": "int", "defaultValue": 0.7, "value": 0.7}, {"name": "stream", "type": "string", "defaultValue": true, "value": true}, {"name": "result", "type": "jsonarray", "defaultValue": null, "value": null}, {"name": "model_config", "type": "text", "value": "{\"protocol\":\"http\",\"method\":\"POST\",\"url\":\"https://api.openai.com/v1/chat/completions\",\"header\":{\"ContentType\":\"application/json\",\"Authorization\":\"Bearer ${OPENAI_API_KEY}\"},\"modelRole\":{\"user\":\"user\",\"system\":\"system\",\"assistant\":\"assistant\"},\"requestBody\":{\"model\":\"gpt-3.5-turbo-0613;gpt-3.5-turbo;gpt-3.5-turbo-16k-0613;gpt-3.5-turbo-16k;gpt-4-0613;gpt-4-32k-0613;gpt-4;gpt-4-32k\",\"messages\":{\"role\":\"${role}\",\"content\":\"${content}\"},\"temperature\":0.7,\"stream\":true},\"responseBody\":{\"id\":\"chatcmpl-7lZq4UwSCrkvyOTUcyReAMXpAydSQ\",\"object\":\"chat.completion\",\"created\":\"1691573536\",\"model\":\"gpt-3.5-turbo-0613\",\"choices\":[{\"index\":0,\"message\":{\"role\":\"assistant\",\"content\":\"${result_context}\"},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":36,\"completion_tokens\":104,\"total_tokens\":140}},\"responseErrorBody\":{\"error\":{\"message\":\"$errorMessage\",\"type\":\"invalid_request_error\",\"param\":null,\"code\":null}}}"}, {"name": "model_param_define", "type": "text", "value": [{"name": "OPENAI_API_KEY", "type": "string", "defaultValue": "password", "value": "password"}, {"name": "model", "type": "select", "defaultValue": "gpt-3.5-turbo,gpt-4.0", "value": "gpt-3.5-turbo,gpt-4.0"}, {"name": "message", "type": "jsonarray", "defaultValue": null, "value": "[{\"role\": \"${role}\", \"content\": \"${content}\"}]"}, {"name": "temperature", "type": "int", "defaultValue": 0.7, "value": 0.7}, {"name": "stream", "type": "string", "defaultValue": true, "value": true}, {"name": "result", "type": "jsonarray", "defaultValue": null, "value": null}]}], "inputs": [{"name": "title", "type": "text", "defaultValue": "", "value": null}, {"name": "number", "type": "text", "defaultValue": "", "value": null}], "outputs": [{"name": "output", "type": "text", "defaultValue": "", "value": ""}], "prompt": "\n    I want you act a famous novelist,\n    I want to write a science fiction,\n        The title is ${title} and number of words require ${number}.\n    "}

    pm_flow.add_node(pm_template_node)

    # Step 4 define a tools script node
    from promptmanager.runtime.flow import PMFlowScriptNode

    script_node = PMFlowScriptNode(name="script_node", path="../script/python3_script.py")

    input = {
        "name": "input",
        "type": "text",
        "defaultValue": "this is single input"
    }
    script_node.add_input(input)

    # inputs = [{
    #     "name": "input1",
    #     "type": "text",
    #     "defaultValue": "this is input1 of inputs"
    # }, {
    #     "name": "input2",
    #     "type": "text",
    #     "defaultValue": "this is input2 of inputs"
    # }]
    # script_node.add_inputs(inputs)

    output = {
        "name": "output",
        "type": "text",
        "defaultValue": "this is single output"
    }
    script_node.add_output(output)

    # outputs = [{
    #     "name": "output1",
    #     "type": "text",
    #     "defaultValue": "this is output1 of outputs"
    # }, {
    #     "name": "output2",
    #     "type": "text",
    #     "defaultValue": "this is output2 of outputs"
    # }]
    # script_node.add_outputs(outputs)

    script_node.show_io_info()
    # $>INFO: this is IOs of "script_node":
    # $>INFO: inputs:[{'name': 'input', 'type': 'text', 'defaultValue': 'this is single input'}]
    # $>INFO: outputs:[{'name': 'output', 'type': 'text', 'defaultValue': 'this is single output'}]

    script_node.show_info()
    # $>INFO: this is node info of "script_node":
    # $>INFO: node info: {"id": "eed4b20e-112e-435e-8a65-a2d513a93b0e", "name": "script_node", "module_id": "00000000-0000-0000-bbbb-000000000003", "module_name": null, "module_type": "script", "left": null, "top": null, "description": "script_node", "params": {"script": [{"name": "script", "type": "text", "default_value": "../script/python3_script.py", "value": "../script/python3_script.py"}]}, "inputs": [{"name": "input", "type": "text", "defaultValue": "this is single input"}], "outputs": [{"name": "output", "type": "text", "defaultValue": "this is single output"}], "script_path": "../script/python3_script.py"}

    pm_flow.add_node(script_node)

    # Step 5 link nodes
    pm_flow.add_edge(source_node=input_node, source_node_output_name="variable_assignment",
                     target_node=pm_template_node, target_node_input_name="title")
    pm_flow.add_edge(source_node=input_node, source_node_output_name="variable_assignment",
                     target_node=pm_template_node, target_node_input_name="number")

    pm_flow.add_edge(source_node=pm_template_node, source_node_output_name="output",
                     target_node=script_node, target_node_input_name="input")

    pm_flow.add_edge(source_node=script_node, source_node_output_name="output",
                     target_node=output_node, target_node_input_name="result1")

    pm_flow.show_info()
    # $>INFO: this is the flow info of "flow_name":
    # $>INFO: info: {"id": "e56fb350-9b1f-4ac0-8179-0f10c9cc1543", "name": "flow_name", "nodes": [{"id": "21ee3784-1f11-40b3-ada5-f7d18df787ac", "name": "input", "module_id": "00000000-0000-0000-aaaa-000000000002", "module_name": "Input", "module_type": "input", "left": null, "top": null, "description": "Input", "params": [{"variable": "title", "type": "text", "defaultValue": "", "value": null}, {"variable": "number", "type": "text", "defaultValue": "", "value": null}], "inputs": [], "outputs": [{"name": "variable_assignment", "type": "any", "defaultValue": null, "value": null}]}, {"id": "122c66f7-09bc-47bb-af25-3f4dfcf6f351", "name": "prompt_tempalte_node", "module_id": null, "module_name": null, "module_type": "prompt", "left": null, "top": null, "description": null, "params": [{"name": "OPENAI_API_KEY", "type": "string", "defaultValue": "password", "value": "password"}, {"name": "model", "type": "select", "defaultValue": "gpt-3.5-turbo,gpt-4.0", "value": "gpt-3.5-turbo,gpt-4.0"}, {"name": "message", "type": "jsonarray", "defaultValue": null, "value": "[{\"role\": \"${role}\", \"content\": \"${content}\"}]"}, {"name": "temperature", "type": "int", "defaultValue": 0.7, "value": 0.7}, {"name": "stream", "type": "string", "defaultValue": true, "value": true}, {"name": "result", "type": "jsonarray", "defaultValue": null, "value": null}, {"name": "model_config", "type": "text", "value": "{\"protocol\":\"http\",\"method\":\"POST\",\"url\":\"https://api.openai.com/v1/chat/completions\",\"header\":{\"ContentType\":\"application/json\",\"Authorization\":\"Bearer ${OPENAI_API_KEY}\"},\"modelRole\":{\"user\":\"user\",\"system\":\"system\",\"assistant\":\"assistant\"},\"requestBody\":{\"model\":\"gpt-3.5-turbo-0613;gpt-3.5-turbo;gpt-3.5-turbo-16k-0613;gpt-3.5-turbo-16k;gpt-4-0613;gpt-4-32k-0613;gpt-4;gpt-4-32k\",\"messages\":{\"role\":\"${role}\",\"content\":\"${content}\"},\"temperature\":0.7,\"stream\":true},\"responseBody\":{\"id\":\"chatcmpl-7lZq4UwSCrkvyOTUcyReAMXpAydSQ\",\"object\":\"chat.completion\",\"created\":\"1691573536\",\"model\":\"gpt-3.5-turbo-0613\",\"choices\":[{\"index\":0,\"message\":{\"role\":\"assistant\",\"content\":\"${result_context}\"},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":36,\"completion_tokens\":104,\"total_tokens\":140}},\"responseErrorBody\":{\"error\":{\"message\":\"$errorMessage\",\"type\":\"invalid_request_error\",\"param\":null,\"code\":null}}}"}, {"name": "model_param_define", "type": "text", "value": [{"name": "OPENAI_API_KEY", "type": "string", "defaultValue": "password", "value": "password"}, {"name": "model", "type": "select", "defaultValue": "gpt-3.5-turbo,gpt-4.0", "value": "gpt-3.5-turbo,gpt-4.0"}, {"name": "message", "type": "jsonarray", "defaultValue": null, "value": "[{\"role\": \"${role}\", \"content\": \"${content}\"}]"}, {"name": "temperature", "type": "int", "defaultValue": 0.7, "value": 0.7}, {"name": "stream", "type": "string", "defaultValue": true, "value": true}, {"name": "result", "type": "jsonarray", "defaultValue": null, "value": null}]}], "inputs": [{"name": "title", "type": "text", "defaultValue": "", "value": null}, {"name": "number", "type": "text", "defaultValue": "", "value": null}], "outputs": [{"name": "output", "type": "text", "defaultValue": "", "value": ""}], "prompt": "\n    I want you act a famous novelist,\n    I want to write a science fiction,\n        The title is ${title} and number of words require ${number}.\n    "}, {"id": "b163265f-f05d-4c7a-b6e8-a41997685477", "name": "script_node", "module_id": "00000000-0000-0000-bbbb-000000000003", "module_name": null, "module_type": "script", "left": null, "top": null, "description": "script_node", "params": {"script": [{"name": "script", "type": "text", "default_value": "../script/python3_script.py", "value": "../script/python3_script.py"}]}, "inputs": [{"name": "input", "type": "text", "defaultValue": "this is single input"}], "outputs": [{"name": "output", "type": "text", "defaultValue": "this is single output"}], "script_path": "../script/python3_script.py"}, {"id": "663a1619-a6ec-457a-ae30-854dd7234555", "name": "output", "module_id": "00000000-0000-0000-aaaa-000000000003", "module_name": "Output", "module_type": "output", "left": null, "top": null, "description": "Output", "params": [], "inputs": [{"name": "result1", "type": "any", "defaultValue": null, "value": null}, {"name": "result2", "type": "any", "defaultValue": null, "value": null}], "outputs": []}], "edges": [{"source_node": "21ee3784-1f11-40b3-ada5-f7d18df787ac", "source_output_name": "variable_assignment", "target_node": "122c66f7-09bc-47bb-af25-3f4dfcf6f351", "target_input_name": "title"}, {"source_node": "21ee3784-1f11-40b3-ada5-f7d18df787ac", "source_output_name": "variable_assignment", "target_node": "122c66f7-09bc-47bb-af25-3f4dfcf6f351", "target_input_name": "number"}, {"source_node": "122c66f7-09bc-47bb-af25-3f4dfcf6f351", "source_output_name": "output", "target_node": "b163265f-f05d-4c7a-b6e8-a41997685477", "target_input_name": "input"}, {"source_node": 
```



## Run Flow



```python
pm_flow.run(variables={
    "title": "trip",
    "number": "500"
}, run_async=False)
```



## Save Flow

```python
pm_flow.save(save_path="/opt/data/text_pm.pmflow")
```



## Load Flow

```python
pmFlow = PMFlow.load(file_path="/opt/data/text_pm.pmflow");
```



## Publish Flow 

```python
from promptmanager.runtime.flow import PMApp

# name is not required, it can define flow and app name
pmApp = PMApp.publish_from_flow(pmFlow, base_url="http://127.0.0.1:8888", name='test')
```

