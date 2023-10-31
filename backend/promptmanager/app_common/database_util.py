from django.db import connection


class DatabaseUtil:
    @staticmethod
    def query(query_sql, params=None, return_dict=False):
        cursor = connection.cursor()
        if params:
            cursor.execute(query_sql, params)
        else:
            cursor.execute(query_sql)
        connection.commit()
        if return_dict:
            return dict_fetchall(cursor)
        else:
            return cursor.fetchall()


def dict_fetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]
