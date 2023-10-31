from django.http import JsonResponse


from promptmanager.app_common.database_util import DatabaseUtil
from promptmanager.app_common.result_maker import ResultMaker
from promptmanager.testmodule.models import UserInfo
from django.core.paginator import Paginator
import datetime
from promptmanager.exception import exception


# Create your views here.

def hello(request):
    data = {}
    data['code'] = 0
    data['message'] = "hello"
    return JsonResponse(data, json_dumps_params={'ensure_ascii': False})


def users(request):
    page_index = request.GET.get('pageIndex', 1)
    page_size = request.GET.get('pageNum', 15)

    users_rs = UserInfo.objects.all().order_by("id")
    p = Paginator(users_rs.values(), page_size)
    users_page = p.page(page_index)

    result = {
        'count': users_rs.count(),
        'rows': list(users_page)
    }

    return ResultMaker.success(result)


def add(request):
    for i in range(0, 10):
        id = i + 1
        user = UserInfo(id=id, username="test" + str(i), password="123456", create_time=datetime.datetime.today(),
                        last_update_time=datetime.datetime.now())
        user.save()
        print("插入数据成功")
        print(user)
    data = {}
    data['code'] = 0
    data['message'] = "插入数据成功"
    return JsonResponse(data, json_dumps_params={'ensure_ascii': False})


def cities(request):
    # cities = TestCity.objects.all()
    total_count = DatabaseUtil.query(query_sql='select count(*) as count from "testcity"')
    cities = DatabaseUtil.query(query_sql='select *  from "testcity" where id < %s and name = %s',
                                params=[3, '北京'])

    data = {}
    data['code'] = 0
    data['data'] = {
        'count': total_count[0],
        'rows': cities
    }
    return JsonResponse(data, json_dumps_params={'ensure_ascii': False})


def error(request):
    raise exception.FLOW_NOT_FOUND()





