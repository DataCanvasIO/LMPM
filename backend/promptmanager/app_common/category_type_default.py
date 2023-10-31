from enum import Enum


class CategoryTypeDefault(Enum):
    SCENE = '00000000-0000-0000-0000-000000000001'
    ROLE = '00000000-0000-0000-0000-000000000002'

    @staticmethod
    def getDefaultIdByType(name):
        for category in CategoryTypeDefault:
            if name == category.name:
                return category.value
        return None
