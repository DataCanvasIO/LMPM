# Prompt Chat

We can have a conversation with the LLM through prompt template;



## PMChatPromptTemplate

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
chat_prompt_template.messages(variables)
```



## without Context

Every interaction with the large language model is independent of the context

```python
from promptmanager.runtime.chat import PMChat 
from promptmanager.runtime.template import PMPromptTemplate
from promptmanager.runtime.template import PMChatPromptTemplate
from promptmanager.runtime.model import PMLLM

role = 'user'
role_prompt = 'I am a user'
content = 'Please Write A science fiction the topic is:${topic[text]} '

pmPromptTemplate = PMPromptTemplate(role_prompt="i am a user", role='user', template_content=content)
variables = pmPromptTemplate.show_variables_info()
var3 = [pmPromptTemplate]
pmchatPrompt = PMChatPromptTemplate(var3)
messages = [{
            "name": "topic",
            "type": "text",
            "defaultValue": "",
            "value": "Alien Cat"
        }
]
message = {
    'topic': 'Alien Cat'
}

from promptmanager.runtime.model import PMOpenAIPMLLM
api_key = "xxxxxx-xxxxxxxxxxxxxxxxxxxx"
params = {'OPENAI_API_KEY': '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', 'model': 'gpt-3.5-turbo', 'stream': False}
pmllm = PMOpenAIPMLLM.load_from_openai_key(api_key)
pmchat = PMChat(pmchatPrompt, pmllm)
result = pmchat.run(message)
result2 = pmchat.run(messages, params)
```

## 



