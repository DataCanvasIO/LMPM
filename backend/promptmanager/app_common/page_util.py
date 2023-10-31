from django.core.paginator import Paginator


class PageUtil:

    @staticmethod
    def get_page(page_index, page_num, result):
        p = Paginator(result.values(), page_num)
        page_data = p.page(page_index)

        page_result = {
            'count': result.count(),
            'rows': list(page_data)
        }

        return page_result


class PageInfo(object):
    def __init__(self, count: int = None, rows: list = None):
        self.rows = rows
        self.count = count





class PageParam(object):
    def __init__(self, page_index: int = 1, page_num: int = 10):
        self.page_index = page_index
        self.page_num = page_num

    def get_offset(self):
        page_index = self.page_index
        if not page_index or page_index < 1:
            page_index = 1

        page_num = self.page_num
        if not page_num or page_num <= 0:
            page_num = 10

        return (page_index - 1) * page_num

    def get_limit(self):
        page_num = self.page_num
        if not page_num or page_num <= 0:
            page_num = 10

        return page_num

    def get_offset_and_limit(self):
        return self.get_offset(), self.get_limit()
