import logging

from promptmanager.runtime.flow import PMNodeOutput
from promptmanager.script.vectorstores import Dingo

logger = logging.getLogger('pm_log')


class DingoDBReader:
    def __init__(self, index_name, embeddings, host=None, port=None, user=None, password=None, vectordb=None):
        self.index_name = index_name
        self.embeddings = embeddings
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.vectordb = vectordb

    def exec(self, text_key, query_text):

        vectorstore = self.vectordb
        if not vectorstore:
            from dingodb import DingoDB
            dingo_client = DingoDB(user=self.user, password=self.password, host=[self.host + ":" + self.port])
            vectorstore = Dingo(self.embeddings, text_key, client=dingo_client, index_name=self.index_name)

        # query = "What did the president say about Ketanji Brown Jackson"
        result = vectorstore.similarity_search(query_text)

        logger.info(result)
        result_str_list = []
        for i, d in enumerate(result):
            result_str_list.append(d.page_content)

        return result_str_list


def run(params: dict, inputs: dict, outputs: dict) -> PMNodeOutput:
    logger.info("Welcome to Use DingoDB Reader!")

    logger.info("This is params info:")
    logger.info(params)
    logger.info("This is inputs info:")
    logger.info(inputs)
    logger.info("This is outputs info:")
    logger.info(outputs)

    logger.info("To query from dingo db:")

    host = params['script']['host']['value']
    port = params['script']['port']['value']
    user = params['script']['user']['value']
    password = params['script']['password']['value']
    index_name = params['script']['index']['value']
    text_key = params['script']['text_key']['value']

    query_text = inputs['query_text']['value']
    embeddings = inputs['embeddings']['value']

    vectordb = inputs['vectordb']['value']

    dingo_reader = DingoDBReader(index_name=index_name, embeddings=embeddings,
                                 host=host, port=port, user=user, password=password, vectordb=vectordb)
    results = dingo_reader.exec(text_key=text_key, query_text=query_text)

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, results)

    return output

    # [Document(page_content='more text!', metadata={'id': 1807286027280, 'text': 'more text!', 'score': 0.53109527}), Document(page_content='more text!', metadata={'id': 1279276667843, 'text': 'more text!', 'score': 0.5310954}), Document(page_content='more text!', metadata={'id': 2707983485852, 'text': 'more text!', 'score': 0.5310954}), Document(page_content='text b', metadata={'id': 1279277372974, 'text': 'text b', 'score': 0.58489686})]

    # retriever = vectorstore.as_retriever(search_type="mmr")
    # matched_docs = retriever.get_relevant_documents(query)
    # for i, d in enumerate(matched_docs):
    #     print(f"\n## Document {i}\n")
    #     print(d.page_content)

    #    ## Document 0

    #    more text!

    #    ## Document 1

    #    text b

    #    ## Document 2

    #    more text!

    #    ## Document 3

    #    more text!
