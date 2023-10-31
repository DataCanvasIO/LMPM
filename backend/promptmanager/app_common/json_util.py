import json


class JsonUtil:

    @staticmethod
    def object_to_dict(obj):
        json_str = json.dumps(obj, ensure_ascii=False, default=lambda obj: obj.__dict__)
        dict = json.loads(json_str)
        return dict

    @staticmethod
    def object_to_json(obj):
        json_str = json.dumps(obj, ensure_ascii=False, default=lambda obj: obj.__dict__)
        return json_str

    @staticmethod
    def json_to_dict(json_str):
        dict = json.loads(json_str)
        return dict

    @staticmethod
    def is_json(text):
        try:
            json.loads(text)
            return True
        except ValueError:
            return False
