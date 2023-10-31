from django.http import JsonResponse


class ResultMaker:

    @staticmethod
    def success(data):
        # if isinstance(data, object):
        #     data = JsonUtil.object_to_dict(data)

        result = {
            "code": 0,
            "data": data
        }
        return JsonResponse(result, json_dumps_params={'ensure_ascii': False})

    @staticmethod
    def fail(code=1, msg=None, data=None):
        result = {
            "code": code,
            "data": {
                "message": msg,
                "data": data
            }
        }
        return JsonResponse(result, json_dumps_params={'ensure_ascii': False})
