# AI Model

Large AI Models of Prompt Manager is support  to custom with many different Large AI Models  by using json config file. and We also provide a preset OpenAI Large Language Models for easy use;

## OpenAI Large language model

We preset a large model class "PMOpenAIPMLLM" that can directly access OpenAI; You can directly access OpenAI's LLM by simply setting the API key

```python
   from promptmanager.runtime.model import PMOpenAIPMLLM

  api_key = "xxxxxx-xxxxxxxxxxxxxxxxxxxx"
  pmOpenAIPMLLM = PMOpenAIPMLLM.load_from_openai_key(api_key)

  message = [{"role": "user", "content": "我要写一本书"}, {"role": "user", "content": "名字叫做《我和你》"}]
  params = [{'name': 'model', 'value': 'gpt-4'}, {'name': 'stream', 'value': False}]

  result = pmOpenAIPMLLM.request_by_message(message, params)
```



## Custom AI Model By Coding

If you have your own large model service that is an interface to the HTTP protocol, Prompt Manager provides a configuration file method that can adapt to the request format of custom large model services

```python
from promptmanager.runtime.model import PMCustomLLM

config = "{  \"protocol\": \"http\",  \"method\": \"POST\",  \"url\": \"https://api.openai.com/v1/chat/completions\",  \"header\": {    \"ContentType\": \"application/json\",   \"Authorization\": \"Bearer ${OPENAI_API_KEY}\"  },\"modelRole\":  {\"user\": \"user\",  \"system\": \"system\",  \"assistant\": \"assistant\"},  \"requestBody\":  {\"model\": \"${model}\",  \"messages\": ${message},  \"temperature\": ${temperature},  \"stream\": ${stream}},  \"responseBody\":{   \"id\": \"chatcmpl-7lZq4UwSCrkvyOTUcyReAMXpAydSQ\",  \"object\": \"chat.completion\",  \"created\": \"1691573536\",  \"model\": \"gpt-3.5-turbo-0613\",  \"choices\": ${result},  \"usage\": {    \"prompt_tokens\": 36,  \"completion_tokens\": 104,  \"total_tokens\": 140}   },  \"responseBody\":{   \"id\": \"chatcmpl-7lZq4UwSCrkvyOTUcyReAMXpAydSQ\",  \"object\": \"chat.completion\",  \"created\": \"1691573536\",  \"model\": \"gpt-3.5-turbo-0613\",  \"choices\": ${result}   },  \"responseErrorBody\":{   \"error\": {    \"message\": \"${errorMessage}\",  \"type\": \"invalid_request_error\",  \"param\": null,  \"code\": null}   },  \"responseStreamBody\":{   \"id\": \"chatcmpl-7lZq4UwSCrkvyOTUcyReAMXpAydSQ\",  \"object\": \"chat.completion\",  \"created\": \"1691573536\",  \"model\": \"gpt-3.5-turbo-0613\",  \"choices\": ${stream_result}   }  }"
params_define = [{
    'name': 'OPENAI_API_KEY',
    'type': 'Password',
    'defaultValue': ''
}, {
    'name': 'message',
    'type': 'Jsonarray',
    'defaultValue': [{'role': '${role}', 'content': '${content}'}]
}, {
    'name': 'temperature',
    'type': 'Double',
    'defaultValue': 0.7
}, {
    'name': 'stream',
    'type': 'Boolean',
    'defaultValue': True
}, {
    'name': 'model',
    'type': 'Select',
    'defaultValue': 'gpt-3.5-turbo-0613;gpt-3.5-turbo;gpt-3.5-turbo-16k-0613;gpt-3.5-turbo-16k;gpt-4-0613;gpt-4-32k-0613;gpt-4;gpt-4-32k'
}, {
    'name': 'result',
    'type': 'Jsonarray',
    'defaultValue': [{
        'index': 0,
        'message': {
            'role': 'assistant', 'content': '${result_context}'
        },
        'finish_reason': 'stop'
    }]
}, {
    "name": "errorMessage",
    "type": "String",
    "defaultValue": None
}, {
    'name': 'stream_result',
    'type': 'Jsonarray',
    'defaultValue': [{
        'index': 0,
        'delta': {
            'role': 'assistant', 'content': '${stream_content}'
        },
        'finish_reason': None
    }]
}]

pmCustomLLM = PMCustomLLM(config, params_define)
message = [{'role': 'user', 'content': '请帮我写一个简单的java程序'}]

result = pmCustomLLM.request_result_by_message(message)
```



## Custom AI Model by config file of JSON

Load a AI model HTTP Request config from file to construct a AI model

```python
from promptmanager.runtime.model import PMLLM

path = '/Users/zhangdi/Desktop/config.json'
pmLLM = PMLLM.load_from_path(path)

message = [{"role": "user", "content": "我要写一本书"}, {"role": "user", "content": "名字叫做《我和你》"}]

result = pmLLM.request_result_by_message(message)
```



## Get Message Text from AI Model





```python
from promptmanager.runtime.model import PMLLM

path = '/Users/zhangdi/Desktop/config.json'
pmLLM = PMLLM.load_from_path(path)

message = [{"role": "user", "content": "我要写一本书"}, {"role": "user", "content": "名字叫做《我和你》"}]
params = pmLLM.show_params_info()
#overwrite params
#...
params = {'OPENAI_API_KEY': 'xxxxxx-xxxxxxxxxxxxxxxxxxxx', 'model': 'gpt-3.5-turbo-16k-0613', 'stream': False}
response = pmLLM.request_result_by_message(message, params)
```





## Get Request Body from AI Model

```python
from promptmanager.runtime.model import PMLLM

path = '/Users/zhangdi/Desktop/config.json'
pmLLM = PMLLM.load_from_path(path)

requestBody = {
  "model": "gpt-3.5-turbo",
  "messages": [{
    "role": "user",
    "content": "我要写一本书"
  }],
  "temperature": 0.7
}

params = {'OPENAI_API_KEY': 'xxxxxx-xxxxxxxxxxxxxxxxxxxx'}
response = pmLLM.request(requestBody, params)
```





## Stream

```python
from typing import Generator

from promptmanager.runtime.model import PMLLM

path = '/Users/zhangdi/Desktop/config.json'
pmLLM = PMLLM.load_from_path(path)

message = [{"role": "user", "content": "我要写一本书"}, {"role": "user", "content": "名字叫做《我和你》"}]
params = pmLLM.show_params_info()
#overwrite params
#...
params = {'OPENAI_API_KEY': 'xxxxxx-xxxxxxxxxxxxxxxxxxxx', 'model': 'gpt-3.5-turbo-16k-0613', 'stream': True}
response = pmLLM.request_result_by_message(message, params)
            
if isinstance(response, Generator):
    for line in response:
        print (line)
```

## Fake Model

Calling the model interface will incur certain costs; If it is a modal process, a fake model can be used to simulate the calling process of a large model

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

