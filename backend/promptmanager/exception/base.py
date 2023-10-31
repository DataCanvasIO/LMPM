# -*- coding: utf-8 -*-
from abc import ABCMeta


class BaseReturn(Exception):
    __metaclass__ = ABCMeta


class OK200(BaseReturn):
    status_code = 200

class OK500(BaseReturn):
    status_code = 500
