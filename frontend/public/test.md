# Prompt Manager Quick Guide

## Introduction

**Prompt Manager** is Open source Prompt  Engineering tools for you use Large model

The main value props of  Prompt Manager are:

- Support custom call large model by using configuration 
- Support  Both **Prompt flow  ** and  **Prompt Chat** from prompt Engineering
- Support for writing **prompt engineering scripts** 
- **Publish prompt application** to easy use Large Model  

### Modules

#### Prompt Template

The new way of programming models is through prompts. A **prompt** refers to the input to the model. This input is often constructed from multiple components. Prompt Manager provides web application ,and  several python SDK functions to make constructing and working with prompts easy.

#### Large AI Model

Large AI Models of Prompt Manager is support  to custom with many different Large AI Models  by using json config file. and We also provide a preset OpenAI Large Language Models for easy use;

#### Prompt engineering 

- Chat  : We can have a conversation with the LLM through prompt template;
- Flow : To achieve complex business logic; I can build a workflow of the Prompt engineering to achieve a more complex and more practical business logic based workflow interacting with LLM;

#### Prompt Application

TODO :Introduction Prompt Application

## Installation

To install Prompt Manager run

### pip install

```shell
pip install promptmanager
```

### conda install

```shell
conda install promptmanager -c conda-forge
```

## Service management

### service start

```shell
pmctl serice start
```

Open Web browser with this URL http://localhost:9999/

### service start with a port

```shell
pmctl serice start -port 10000
```

### service stop

```
pmctl serice stop
```

## Environment setup

In order to make sure your prompt  script run successfully your need to prepare Python Environment first;

support both PIP Environment  and Conda Environment  

### HTTP Request

If your already publish a Prompt Flow to an Application ;

```shell
curl http://localhost:9999/api/app/<appid>/run -X POST  -H 'appkey:xxxxxxxxxxxx' -H 'Content-Type:application/json' -d '{"variables":{"title":"","number":500}}'
```

#### HTTP Request with File

First upload your file like this:

```shell
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

- **Run prompt manager chat**

```python
from promptmanager.runtime.chat import PMchat 
template = """ 
I want you act a famous novelist,
I want to write a science fiction, 
    The title is ${title} and number of words require ${number}.
"""
variables={
            "title":"Black hole traversal",
    		"number":500
          }
from promptmanager.runtime.model import PMLLM
openai_llm=PMLLM.from_OpenAI(api_key="xxxxxx-xxxxxxxxxxxxxxxxxxxx")
result=PMchat.run(template=template,variables=variables,lm=openai_llm)
```

- **Run prompt manager chat with-Context**

```
from promptmanager.runtime.chat import PMchat 
template1 = """ 
I want you act a famous novelist,
I want to write a science fiction, 
    The title is ${title} and number of words require ${number}.
"""
variables1={
            "title":"Black hole traversal",
    		"number":500
          }
from promptmanager.runtime.model import PMLLM
openai_llm=PMLLM.from_OpenAI(api_key="xxxxxx-xxxxxxxxxxxxxxxxxxxx")
result=PMchat.run_whth_context(template=template1,variables=variables1,lm=openai_llm,session_id="session01")
template2 = """ 
I want get the summary form fiction 
"""   
result2=PMchat.run_whth_context(template=template2,lm=openai_llm,session_id="session01")
```

- **Custom LLM**

```python
from promptmanager.runtime.chat import PMchat 
template = """ 
I want you act a famous novelist,
I want to write a science fiction, 
    The title is ${title} and number of words require ${number}.
"""
variables={
            "title":"Black hole traversal",
    		"number":500
          }
from promptmanager.runtime.model import PMLLM

request_body=PMLLM.from_prompt_template(template)
request_info=PMLLM.Custom_Model_Request_Info(
    "url":"https://org.openapi.com",
    headers={"api key":"xxxxxxxxx"},
    request_body=request_body)

custom_model=PMLLM.from_Custom_Model_Request_Inf(request_info=request_info)

result=PMchat.run(template=template,variables=variables,lm=custom_model)
```

- **Fake LLM**

```python

from promptmanager.runtime.chat import PMchat 
template = """ 
I want you act a famous novelist,
I want to write a science fiction, 
    The title is ${title} and number of words require ${number}.
"""
variables={
            "title":"Black hole traversal",
    		"number":200
          }
from promptmanager.runtime.model import PMLLM

template=PMLLM.from_prompt_template(template)
answer=""" 
"In a distant future, humanity has achieved a remarkable feat: the ability to traverse black holes. These enigmatic cosmic phenomena, once feared for their destructive power, have now become gateways to unexplored realms of the universe. The story follows a team of intrepid scientists and explorers who embark on a perilous journey through a black hole known as 'Eventide.' Their mission: to unravel the mysteries that lie beyond and discover what secrets the universe holds within its gravitational grasp.

As they venture deeper into the black hole's swirling abyss, the laws of physics bend and reality becomes a kaleidoscope of mind-bending phenomena. Time loses its grip, space warps, and the boundaries of known science are shattered. The crew must confront their deepest fears and grapple with the existential questions that arise when faced with the infinite.

Amidst the cosmic wonders and dangers, they encounter civilizations from distant galaxies, each with their own unique cultures and technologies. But as they delve further into the unknown, they stumble upon a dark force that threatens not only their mission but the very fabric of the universe itself. It becomes a race against time to unlock the secrets of the black hole and prevent a cataclysmic event that could consume everything in its path.

'Black Hole Traversal' is an epic tale of exploration, courage, and the boundless potential of the human spirit. It challenges our understanding of the cosmos and explores the profound connections that exist between science, humanity, and the mysteries of the universe."

Please note that the above introduction is just a starting point, and you have the freedom to develop the story further as per your imagination. Good luck with your science fiction adventure!
""" 
fake_model=PMLLM.from_fake_model(template=template,answer=answer)

result=PMchat.run(template=template,variables=variables,lm=fack_model)

```

- **Semantic recall from Vector Database**

```python
from promptmanager.runtime.tools.vectordatabase import ChromaReader 
from promptmanager.runtime.embedding import OpenAIEmbedding
openai_enbedding=OpenAIEmbedding(apikey="xxxxxxxxxxxxxxxxx")
chroma_reader= ChromaReader(connection={"url":"","username":"dcuser","password":"xxxxxx"},embedding=openai_enbedding)
```

- **Build prompt flow**

```python
from promptmanager.runtime.flow import PMflow
#Setp 1 create new PMflow
pmflow=PMflow(name="test_flow")
#Setp 2 define PMflow inputs and outputs
from promptmanager.runtime.flow import PMflowInput
pminput=PMflowInputNode(variables=[{"name":"file_path","type":"text","number":"text"}])
pmflow.set_input_node(pminput)

pmoutput=PMflowOutputNode(variables=[{"name":"text_output","type":"text"}])
pmflow.set_output_node(pmoutput)

#Setp 3 define PMflow a tools script node

from promptmanager.runtime.tools import PMFileReaderSripteNode
pmfile_reader_node=PMFileReaderSripteNode(alias="file reader")
#show the variables of pmfile_reader_node
pmfile_reader_node.show_variables()

#$>this is the variables of "file reader":
#$>input_variables:[{"name":"file_path","type":"text"}]
#$>output_variables:[{"name":"context","type":"text"}]

pmfile_reader_node.add_node_mapping(source_node=pminout,source_var_name="file_path",target_var_name="file_path")
pmflow.add_node(node=pmfile_reader_node)
#Setp 4 define PMflow a prompt template node

from promptmanager.runtime.chat import PMchat 
template = """ 
I want you to act a student,
I need you to reader the actcle ${actcle}, 
write a Post reading feedback ,and the number of words require ${number}.
"""
from promptmanager.runtime.model import PMLLM
openai_llm=PMLLM.from_OpenAI(api_key="xxxxxx-xxxxxxxxxxxxxxxxxxxx")
pmtemplate_node=PMflow.from_template_node(alias="first node",template=template,lm=openai_llm)
pmtemplate_node.add_node_mapping(source_node=pmfile_reader_node,source_var_name="context",target_var_name="actcle")
pmflow.add_node(node=pmtemplate_node)

pmoutput.add_node_mapping(source_node=pmtemplate_node,source_var=pmtemplate_node.output(),target_var_name="text_output")

#Setp 5 pmflow run
pmflow.run(variables={
            "file_path":"/opt/file/text.txt",
    		"number":500
          })
pmflow.save(save_path="/opt/data/text_pm.pmflow")
```

- **Load pmflow from disk**

```python
from promptmanager.runtime.flow import PMflow 

# Load pmflow from disk
pmflow=pmflow.load(save_path="/opt/data/text_pm.pmflow");

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
pmflow=pmflow.load(save_path="/opt/data/text_pm.pmflow");

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
from promptmanager.runtime.app import PMapp 

# App can also be exported from web sdk
pmapp2=PMapp.from_web_api_id(url="http://localhost:9999/app/xxxxxxxxxxxxxxxxxxxxx");
pmapp2.show_varirables()
#$>this is the variables of "xxxxxxxxxxxxxxx":
#$>input_variables:[{"name":"file_path","type":"text"}]
#$>output_variables:[{"name":"text_output","type":"text"}]
variables={"title":"Black hole traversal","number":500}
result = pmapp2.run(variables=variables)
```

- **Run prompt manager application with file**

```python
from promptmanager.runtime.app import PMapp 

variables={"title":"title","number":500,"file":"/opt/knowledge_base.txt"}
result = PMapp.run(id="<appid>",variables=variables)
```



