# -*- coding: utf-8 -*-
import inspect

from django.http import JsonResponse

from . import base, exception


def get_all_error_code(request):
    ret_list = [(item[1].status_code, item[1].__name__, item[1].message)
                for item in inspect.getmembers(exception)
                if inspect.isclass(item[1]) and item not in inspect.getmembers(base)]
    return JsonResponse({'http_status_code - error_code - message': sorted(ret_list, key=lambda x: x[0])})
