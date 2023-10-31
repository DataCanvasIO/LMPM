## 简介

django-exceptionbox 是一个 Django 的异常处理工具包。

将 HTTP 状态码封装成 Python 异常 Base 类，使用 raise 抛出异常，通过 Django 中间件，统一处理异常，打印日志。

通过继承 base.py 中的异常类，可以实现对异常的封装。

需要注意的是，返回的错误码是类名，是一个短语。这样处理的目的是为了前后端更易于理解和使用。

下载包之后，需要重命名为 exceptionbox。

## 配置

添加中间件 'exceptionbox.middleware.ExceptionBoxMiddleware' 到 settings中

```python
MIDDLEWARE_CLASSES = (
    'exception.middleware.ExceptionBoxMiddleware',
    ...
)
```

中间件的位置没有特殊要求。

## 使用

### 第一步

在 `exceptionbox/error.py` 文件，继承 `base.py` 中的异常类，实现业务逻辑相关的异常类。

例如：

```python
class ERROR_LOGIN_FRONT_PAY_NOT_MONEY(base.PreconditionFailed412):
    message = "没有足够余额"
```

### 第二步

在 `views.py` 文件中，抛出异常。

```python

from promptmanager import exception


def my_view(request):
    raise exception.ERROR_LOGIN_FRONT_PAY_NOT_MONEY()
```

接口返回

status_code = 412

```json
{
    "message": "没有足够余额",
    "code": "ERROR_LOGIN_FRONT_PAY_NOT_MONEY",
    "data": null,
    "result": false
}
```
