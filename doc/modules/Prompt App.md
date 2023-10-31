# Prompt App

Prompt Application is a service for prompt flow ; We can publish a prompt flow to a prompt App,then we can run the flow on server at anywhere by http api;



## Publish App

wen can publish a prompt flow to App

```python
from promptmanager.runtime.app import PMApp
from promptmanager.runtime.flow import PMflow 

pmFlow = PMflow.load(save_path="/opt/data/text_pm.pmflow");
# name is not required, it can define flow and app name
pmApp = PMApp.publish_from_flow(pmFlow, base_url="http://127.0.0.1:8888", name='test')
variables = {"title":"Black hole traversal","number":500}
result = pmApp.run(variables)
```

## Run APP

We can run the app like this

```python
from promptmanager.runtime.app import PMApp

variables = {"title":"Black hole traversal","number":500}
url = "http://127.0.0.1:8888/api/app/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/run"
result = PMApp.run(variables, url)

```



