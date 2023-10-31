import json


class HttpRequestUtil:
    @staticmethod
    def get_http_request_body(request):
        request_body = request.body
        params = json.loads(request_body.decode())
        return params
