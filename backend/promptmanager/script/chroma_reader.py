import logging

from promptmanager.runtime.exception import flow_exception
from promptmanager.runtime.flow import PMNodeOutput

logger = logging.getLogger('pm_log')


class ChromaReader:
    def __init__(self, host=None, port=None, collection_name=None, collection=None):
        self.host = host
        self.port = port
        self.collection_name = collection_name
        self.collection = collection

    def exec(self, query_text, n_results) -> list:
        query_collection = self.get_query_collection()

        results = query_collection.query(
            query_texts=[query_text],
            n_results=int(n_results)
        )

        result_str_list = []
        if results:
            documents = results["documents"]
            if documents:
                result_str_list = documents[0]

        logger.info(result_str_list)

        return result_str_list

    from chromadb.api.models import Collection
    def get_query_collection(self) -> Collection:
        query_collection = self.collection

        if not query_collection:
            # remote chromadb
            import chromadb
            from chromadb.utils import embedding_functions

            client = chromadb.HttpClient(host=self.host, port=self.port)
            emb_fn = embedding_functions.ONNXMiniLM_L6_V2()
            query_collection = client.get_collection(name=self.collection_name, embedding_function=emb_fn)

        return query_collection


def run(params: dict, inputs: dict, outputs: dict) -> PMNodeOutput:
    logger.info("Welcome to Use Chroma Reader!")

    logger.info("This is params info:")
    logger.info(params)
    logger.info("This is inputs info:")
    logger.info(inputs)
    logger.info("This is outputs info:")
    logger.info(outputs)


    query_text = inputs['query_text']['value']
    collection = inputs['collection']['value']

    host = params['script']['host']['value']
    port = params['script']['port']['value']
    collection_name = params['script']['collection']['value']
    n_results = params['script']['n_results']['value']

    if not collection:
        if not host:
            raise flow_exception.NODE_PARAMS_ILLEGAL(param_name='host')
        if not port:
            raise flow_exception.NODE_PARAMS_ILLEGAL(param_name='port')
        if not collection_name:
            raise flow_exception.NODE_PARAMS_ILLEGAL(param_name='collection')
        if not n_results:
            n_results = 10



    logger.info("To query from chroma db:")
    chroma_reader = ChromaReader(host=host, port=port, collection_name=collection_name, collection=collection)

    results = chroma_reader.exec(query_text, n_results)

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, results)

    return output

# if __name__ == '__main__':
#     params = {
#         "script":{
#             "host":{
#                 "value":'172.20.52.122'
#             },
#             "port":{
#                 "value":8000
#             },
#             "collection":{
#                 "value":"my_collection"
#             },
#             "n_results":{
#                 "value":10
#             }
#         }
#     }
#
#     inputs = {
#         "query_text":{ "value": "This is a query text"},
#         "collection":{"value":None}
#     }
#
#     run(params, inputs, None)
