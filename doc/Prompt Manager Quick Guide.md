# Prompt Manager Quick Guide

## Introduction

**Prompt Manager** The design and construction tool for large model prompt words guides users to generate more accurate, reliable, and expected output content by helping them design better prompt words. This tool can provide SDK development modes for both technical personnel and non-technical personnel, as well as interface interaction operation modes to meet the needs of different populations using large models. The main functions include model service management, scenario management, prompt word template management, prompt word development, and prompt word application. The specific features are as follows:

. Support docking with commonly used large language models, including OpenAl's GPT model and other open source or custom large language model access interfaces; Support the management of prompt word templates, scene and role management, preset commonly used prompt templates, including Zero shot, One shot, Few shot, COT, etc. Support interaction with the model through dialogue, and can develop prompt words during the dialogue process

. Supports the construction, organization, and operation of prompt workflows, and supports publishing prompt engineering workflows as prompt word applications

Reminder workflow supports customizable Python scripts to prompt personalized requirements for engineering business

Reminder workflows support docking with commonly used vector databases, such as Dingo-DB, Chroma, FAISS, etc. Reminder workflows preset commonly used toolkits, including text segmentation, text segmentation, text conversion, etc

Support publishing prompt workflows as prompt word applications, accessed through the HTTP interface, and exporting the application as an SDK

The prompt word engineering tool supports running in SDK mode and can be quickly integrated into the development environment to help developers complete the construction and use of the prompt word engineering



### Modules

#### Prompt Template

The new way of programming models is through prompts. A **prompt** refers to the input to the model. This input is often constructed from multiple components. Prompt Manager provides web application ,and  several python SDK functions to make constructing and working with prompts easy.

#### Large AI Model

Large AI Models of Prompt Manager is support  to custom with many different Large AI Models  by using json config file. and We also provide a preset OpenAI Large Language Models for easy use;

#### Prompt engineering 

- Chat  : We can have a conversation with the LLM through prompt template;
- Flow : To achieve complex business logic; I can build a workflow of the Prompt engineering to achieve a more complex and more practical business logic based workflow interacting with LLM;

#### Prompt Application

Prompt Application is a service for prompt flow ;
We can publish a prompt flow to a prompt App,then we can  run the flow on server at anywhere by http api;

## Installation

To install Prompt Manager run

### pip install

```shell
pip install promptmanager
```

## Service management

### service start

```shell
pmctl serice start
```

Open Web browser with this URL http://localhost:9999/

### service start with a port

```
pmctl serice start -port 10000
```

### service stop

```
pmctl serice stop
```

## Environment setup

In order to make sure your prompt  script run successfully your need to prepare Python Environment first;

### HTTP Request

If your already publish a Prompt Flow to an Application ;

```shell
curl http://localhost:9999/api/app/<appid>/run -X POST  -H 'appkey:xxxxxxxxxxxx' -H 'Content-Type:application/json' -d '{"variables":{"title":"","number":500}}'
```

#### HTTP Request with File

First upload your file like this:

```
curl http://localhost:9999/api/app/<appid>/upload -F 'file=@/opt/knowledge_base.txt'
```

Then you will get the HTTP response result like this:

```json
{
  "code":0,
  "data":{
      "uploadFilePath":"/mnt/promptmanager/tmp/upload/2023-03-08/xxxxxxxxxxxxxxxxx/knowledge_base.txt"
  }
}
```

Then get the uploadFilePath from the json and put it into the "file" variable

```shell
curl http://localhost:9999/api/app/<appid>/run -X POST -H 'appkey:xxxxxxxxxxxx' -H 'Content-Type:application/json' -d '{"variables":{"title":"","number":500,"file":"/mnt/promptmanager/tmp/upload/2023-03-08/xxxxxxxxxxxxxxxxx/knowledge_base.txt"}}'
```

### Python SDK

**Prompt Template**

```
from promptmanager.runtime.template import PMPromptTemplate
role_prompt = "i am role_prompt"
prompt_template = PMPromptTemplate("user","Tell me a ${adjective} joke about ${content}.",role_prompt)

variables={
            "adjective":"funny",
    		"content":"chickens"
          }

prompt_template.message(variables)
```



- **Run prompt manager chat**

```python
from promptmanager.runtime.template import PMPromptTemplate
from promptmanager.runtime.template import PMChatPromptTemplate
chat_prompt_template = PMChatPromptTemplate(
    [
        PMPromptTemplate("user","Tell me a ${adjective} joke about ${content}.","i am role_prompt2"),
        PMPromptTemplate("system","Your name is ${name}.","i am role_prompt1")
    ]
)
 

variables={
            "adjective":"funny",
    		"content":"chickens",
            "name":"Bob"
          }
chat_prompt_template.message(variables)
```

- **OpenAI LLM**

```python
  from promptmanager.runtime.model import PMOpenAIPMLLM

  api_key = "xxxxxx-xxxxxxxxxxxxxxxxxxxx"
  pmOpenAIPMLLM = PMOpenAIPMLLM.load_from_openai_key(api_key)

  message = [{"role": "user", "content": "我要写一本书"}, {"role": "user", "content": "名字叫做《我和你》"}]
  params = {'temperature':0.8}

  result = pmOpenAIPMLLM.request_by_message(message, params)
```

- **Fake LLM**

```python
from promptmanager.runtime.model import PMFakeLLM

response = [
  					'Action: Python REPL\nAction Input: chatGpt principle',
  					'Final Answer: mock result'
					]
pmFakeLLM = PMFakeLLM(response)

message = [{"role": "user", "content": "我要写一本书"}, {"role": "user", "content": "名字叫做《我和你》"}]
result = pmFakeLLM.request_result_by_message(message)

```

- **Semantic recall from Vector Database**

```python
from promptmanager.runtime.tools.vectordatabase import ChromaReader 
from promptmanager.runtime.embedding import OpenAIEmbedding
openai_enbedding=OpenAIEmbedding(apikey="xxxxxxxxxxxxxxxxx")
chroma_reader= ChromaReader(host="",port="",collection_name="")
```

- **Build prompt flow**

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
        "OPENAI_API_KEY": "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"
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
    # $>INFO: info: {"id": "e56fb350-9b1f-4ac0-8179-0f10c9cc1543", "name": "flow_name", "nodes": [{"id": "21ee3784-1f11-40b3-ada5-f7d18df787ac", "name": "input", "module_id": "00000000-0000-0000-aaaa-000000000002", "module_name": "Input", "module_type": "input", "left": null, "top": null, "description": "Input", "params": [{"variable": "title", "type": "text", "defaultValue": "", "value": null}, {"variable": "number", "type": "text", "defaultValue": "", "value": null}], "inputs": [], "outputs": [{"name": "variable_assignment", "type": "any", "defaultValue": null, "value": null}]}, {"id": "122c66f7-09bc-47bb-af25-3f4dfcf6f351", "name": "prompt_tempalte_node", "module_id": null, "module_name": null, "module_type": "prompt", "left": null, "top": null, "description": null, "params": [{"name": "OPENAI_API_KEY", "type": "string", "defaultValue": "password", "value": "password"}, {"name": "model", "type": "select", "defaultValue": "gpt-3.5-turbo,gpt-4.0", "value": "gpt-3.5-turbo,gpt-4.0"}, {"name": "message", "type": "jsonarray", "defaultValue": null, "value": "[{\"role\": \"${role}\", \"content\": \"${content}\"}]"}, {"name": "temperature", "type": "int", "defaultValue": 0.7, "value": 0.7}, {"name": "stream", "type": "string", "defaultValue": true, "value": true}, {"name": "result", "type": "jsonarray", "defaultValue": null, "value": null}, {"name": "model_config", "type": "text", "value": "{\"protocol\":\"http\",\"method\":\"POST\",\"url\":\"https://api.openai.com/v1/chat/completions\",\"header\":{\"ContentType\":\"application/json\",\"Authorization\":\"Bearer ${OPENAI_API_KEY}\"},\"modelRole\":{\"user\":\"user\",\"system\":\"system\",\"assistant\":\"assistant\"},\"requestBody\":{\"model\":\"gpt-3.5-turbo-0613;gpt-3.5-turbo;gpt-3.5-turbo-16k-0613;gpt-3.5-turbo-16k;gpt-4-0613;gpt-4-32k-0613;gpt-4;gpt-4-32k\",\"messages\":{\"role\":\"${role}\",\"content\":\"${content}\"},\"temperature\":0.7,\"stream\":true},\"responseBody\":{\"id\":\"chatcmpl-7lZq4UwSCrkvyOTUcyReAMXpAydSQ\",\"object\":\"chat.completion\",\"created\":\"1691573536\",\"model\":\"gpt-3.5-turbo-0613\",\"choices\":[{\"index\":0,\"message\":{\"role\":\"assistant\",\"content\":\"${result_context}\"},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":36,\"completion_tokens\":104,\"total_tokens\":140}},\"responseErrorBody\":{\"error\":{\"message\":\"$errorMessage\",\"type\":\"invalid_request_error\",\"param\":null,\"code\":null}}}"}, {"name": "model_param_define", "type": "text", "value": [{"name": "OPENAI_API_KEY", "type": "string", "defaultValue": "password", "value": "password"}, {"name": "model", "type": "select", "defaultValue": "gpt-3.5-turbo,gpt-4.0", "value": "gpt-3.5-turbo,gpt-4.0"}, {"name": "message", "type": "jsonarray", "defaultValue": null, "value": "[{\"role\": \"${role}\", \"content\": \"${content}\"}]"}, {"name": "temperature", "type": "int", "defaultValue": 0.7, "value": 0.7}, {"name": "stream", "type": "string", "defaultValue": true, "value": true}, {"name": "result", "type": "jsonarray", "defaultValue": null, "value": null}]}], "inputs": [{"name": "title", "type": "text", "defaultValue": "", "value": null}, {"name": "number", "type": "text", "defaultValue": "", "value": null}], "outputs": [{"name": "output", "type": "text", "defaultValue": "", "value": ""}], "prompt": "\n    I want you act a famous novelist,\n    I want to write a science fiction,\n        The title is ${title} and number of words require ${number}.\n    "}, {"id": "b163265f-f05d-4c7a-b6e8-a41997685477", "name": "script_node", "module_id": "00000000-0000-0000-bbbb-000000000003", "module_name": null, "module_type": "script", "left": null, "top": null, "description": "script_node", "params": {"script": [{"name": "script", "type": "text", "default_value": "../script/python3_script.py", "value": "../script/python3_script.py"}]}, "inputs": [{"name": "input", "type": "text", "defaultValue": "this is single input"}], "outputs": [{"name": "output", "type": "text", "defaultValue": "this is single output"}], "script_path": "../script/python3_script.py"}, {"id": "663a1619-a6ec-457a-ae30-854dd7234555", "name": "output", "module_id": "00000000-0000-0000-aaaa-000000000003", "module_name": "Output", "module_type": "output", "left": null, "top": null, "description": "Output", "params": [], "inputs": [{"name": "result1", "type": "any", "defaultValue": null, "value": null}, {"name": "result2", "type": "any", "defaultValue": null, "value": null}], "outputs": []}], "edges": [{"source_node": "21ee3784-1f11-40b3-ada5-f7d18df787ac", "source_output_name": "variable_assignment", "target_node": "122c66f7-09bc-47bb-af25-3f4dfcf6f351", "target_input_name": "title"}, {"source_node": "21ee3784-1f11-40b3-ada5-f7d18df787ac", "source_output_name": "variable_assignment", "target_node": "122c66f7-09bc-47bb-af25-3f4dfcf6f351", "target_input_name": "number"}, {"source_node": "122c66f7-09bc-47bb-af25-3f4dfcf6f351", "source_output_name": "output", "target_node": "b163265f-f05d-4c7a-b6e8-a41997685477", "target_input_name": "input"}, {"source_node": "b163265f-f05d-4c7a-b6e8-a41997685477", "source_output_name": "output", "target_node": "663a1619-a6ec-457a-ae30-854dd7234555", "target_input_name": "result1"}], "params": [], "flow_result": {"flow_id": null, "flow_name": null, "start_time": null, "end_time": null, "status": null, "nodes_info": null, "outputs": null}}

    # save pmflow
    pm_flow.save(save_path="/opt/data/text_pm.pmflow")

    # Step 5 pmflow run
    pm_flow.show_variables()
    # $>INFO: this is the flow variables of "flow_name":
    # $>INFO: variables:[{"variable": "title", "type": "text", "defaultValue": "", "value": null}, {"variable": "number", "type": "text", "defaultValue": "", "value": null}]

    pm_flow.run(variables={
        "title": "trip",
        "number": "500"
    }, run_async=False)

    # get flow run result
    # pm_flow.show_result(output_name="result1", wait_finish=False)
    pm_flow.show_result()

    # flow_result = pm_flow.get_result(wait_finish=True)

    # result = None
    # while pm_flow.get_result(wait_finish=False).is_finish():
    #     result = pm_flow.get_result(wait_finish=True)

```

- **Load pmflow from disk**

```python
from promptmanager.runtime.flow import PMflow 

# Load pmflow from disk
pmflow=pmflow.load(file_path="/opt/data/text_pm.pmflow");

pmflow.show_varirables()
#$>this is the variables of "xxxxxxxxxxxxxxx":
#$>input_variables:[{"name":"file_path","type":"text"}]
#$>output_variables:[{"name":"text_output","type":"text"}]

variables={"title":"Black hole traversal","number":500}
result = pmflow.run(variables=variables)
```

- **publish pmflow to web app**

```python

from promptmanager.runtime.flow import PMflow 
# Load pmflow from disk
pmflow=pmflow.load(file_path="/opt/data/text_pm.pmflow");

pmflow.show_varirables()
#$>this is the variables of "xxxxxxxxxxxxxxx":
#$>input_variables:[{"name":"file_path","type":"text"}]
#$>output_variables:[{"name":"text_output","type":"text"}]
from promptmanager.runtime.app import PMapp 
pmapp=PMapp.from_flow(pmflow,url="http://localhost:9999")

variables={"title":"Black hole traversal","number":500}
result = pmapp2.run(variables=variables)
```

- **Run prompt manager application from web API**

```python
from promptmanager.runtime.app import PMApp
from promptmanager.runtime.flow import PMflow 

pmFlow = PMFlow.load('/opt/data/text_pm.pmflow');
pmApp = PMApp.publish_from_flow(pmFlow, 'http://127.0.0.1:8888')
variables = {'title': 'Black hole traversal', 'number': 500}
pmApp.run_by_pm_flow(variables=variables)

pmApp.show_result()
```

- **Run prompt manager application with file**

```python
from promptmanager.runtime.app import PMApp

variables = {'title': 'Black hole traversal', 'number': 500}
url = 'http://127.0.0.1:8888/api/app/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/run'
PMApp.run_by_app_url(url, variables)
```



