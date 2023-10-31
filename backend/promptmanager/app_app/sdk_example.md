```python
from pathlib import Path

from promptmanager.runtime.app import PMApp
from promptmanager.runtime.flow import PMFlow

# example1
pmFlow = PMFlow.load(Path(__file__).resolve().parent / "flow/fc815003-cd5a-44b6-9593-0dce13f1f138/text_pm.pmflow");
pmApp = PMApp.publish_from_flow(pmFlow, "https://promptmanager.zetyun.cn")
variables = [{"variable": "titletitletitletitle", "type": "text", "defaultValue": "", "value": ""}, {"variable": "num1num1num1num1num1num1num1num1", "type": "text", "defaultValue": "", "value": ""}]
pmApp.run_by_pm_flow(variables=variables)
pmApp.show_result()

# example2
variables = [{"variable": "titletitletitletitle", "type": "text", "defaultValue": ""}, {"variable": "num1num1num1num1num1num1num1num1", "type": "text", "defaultValue": ""}]
url = "https://promptmanager.zetyun.cn/api/app/27a3909c-fe7b-442c-b05c-344630ebea03/run"
PMApp.run_by_app_url(url, variables)
```