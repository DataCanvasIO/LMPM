from django.http import FileResponse

from promptmanager.app_common.database_util import DatabaseUtil
from promptmanager.app_common.result_maker import ResultMaker

from promptmanager.exception import exception
from pathlib import Path


def component(request):
    if request.method != 'GET':
        raise exception.REQUEST_TYPE_NOT_SUPPORT()

    prompt_count = DatabaseUtil.query(query_sql='select count(*) from prompt')
    model_count = DatabaseUtil.query(query_sql='select count(*) from model')
    flow_count = DatabaseUtil.query(query_sql='select count(*) from flow')
    app_count = DatabaseUtil.query(query_sql='select count(*) from app')

    result = {
        'prompt': prompt_count[0][0],
        'model': model_count[0][0],
        'flow': flow_count[0][0],
        'app': app_count[0][0]
    }

    return ResultMaker.success(result)


def qucikguide(request):
    path = Path(__file__).resolve().parent / 'Prompt Manager Quick Guide.md'
    return FileResponse(open(path, 'rb'))