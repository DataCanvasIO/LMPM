import requests
import json

from promptmanager.runtime.flow import PMFlow
from promptmanager.runtime.common_util import PMCommonUtil
from promptmanager.runtime.exception import app_exception

publish_flow_url = '/api/app/from/flow/publish'
delete_flow_url = '/api/flow/app/delete'


class PMApp:
    def __init__(self, pm_flow:PMFlow=None, base_url=None, app_id=None):
        self.pm_flow = pm_flow
        self.base_url = base_url
        self._app_id = app_id

    @staticmethod
    def publish_from_flow(pm_flow:PMFlow, base_url, name=None):
        # http://127.0.0.1:8888
        app_publish_url = base_url + publish_flow_url
        data = {'pm_flow': PMCommonUtil.object_to_json(pm_flow), 'name': name}
        req = requests.post(url=app_publish_url, json=data)
        if req.status_code != 200:
            raise app_exception.PUBLISH_FROM_FLOW_ERROR(10001, req.text)
        else:
            response = json.loads(req.text)
            if 'code' in response and response['code'] != 0:
                raise app_exception.PUBLISH_FROM_FLOW_ERROR(10001, response['data']['message'])
        return PMApp(pm_flow, base_url)

    def run_by_pm_flow(self, variables, run_async=False):
        pm_flow = self.pm_flow
        try:
            pm_flow.run(variables=variables, run_async=run_async)
        except Exception as e:
            flow_id = pm_flow.id
            data = {'id': flow_id}
            requests.delete(url=self.base_url + delete_flow_url, json=data)
            raise e


    def show_result(self):
        pm_flow = self.pm_flow
        return pm_flow.get_result()

    @staticmethod
    def run_by_app_url(url, variables):
        if isinstance(variables, dict):
            variables = PMCommonUtil.convert_dict_to_list(variables)
        data = {'variables': variables}
        #http://127.0.0.1:8888/api/app/518cd781-6ca4-401b-7202-4bb2c90ced4c/run
        req = requests.post(url=url, json=data)
        if req.status_code != 200:
            raise app_exception.RUN_APP_ERROR(10002, req.text)
        else:
            response = json.loads(req.text)
            if 'code' in response and response['code'] != 0:
                raise app_exception.RUN_APP_ERROR(10002, response['data']['message'])
        return response['data']