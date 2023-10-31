import logging

from promptmanager.runtime.flow import PMNodeOutput
from promptmanager.script.schema.document import PMDocument
from promptmanager.script.vectorstores import Dingo

logger = logging.getLogger('pm_log')


class DingoDBWriter:
    def __init__(self, host, port, user, password, embeddings):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.embeddings = embeddings

    def exec(self, text_key, index_name, dimension, documents: list[PMDocument] = None):
        from dingodb import DingoDB
        dingo_client = DingoDB(user=self.user, password=self.password, host=[self.host + ":" + self.port])
        if index_name not in dingo_client.get_index():
            dingo_client.create_index(
                index_name=index_name,
                dimension=dimension,
                metric_type='cosine',
                auto_id=False
            )
        # First, check if our index already exists. If it doesn't, we create it
        # if index_name not in dingo_client.get_index():
        #     # we create a new index, modify to your own
        #     dingo_client.create_index(
        #         index_name=index_name,
        #         dimension=1024,
        #         metric_type='cosine',
        #         auto_id=False
        #     )
        # from promptmanager.script.base.embeddings.huggingface import HuggingFaceEmbeddings
        # model_name = "GanymedeNil/text2vec-large-chinese"
        ###向量化工具
        # embeddings = HuggingFaceEmbeddings(model_name=model_name, model_kwargs={'device': "cuda"})
        # embeddings = HuggingFaceEmbeddings(model_name=model_name, model_kwargs={'device': "cpu"})  # 换成cpu也行

        vectorstore = Dingo(self.embeddings, text_key, client=dingo_client, index_name=index_name)

        for doc in documents:
            logger.info("write to dingo,content:")
            logger.info(doc.page_content)
            logger.info(doc.metadata)

            vectorstore.add_texts(texts=[doc.page_content], text_key=text_key)

        return vectorstore


def run(params: dict, inputs: dict, outputs: dict) -> PMNodeOutput:
    logger.info("Welcome to Use DingoDB Writer!")

    logger.info("This is params info:")
    logger.info(params)
    logger.info("This is inputs info:")
    logger.info(inputs)
    logger.info("This is outputs info:")
    logger.info(outputs)

    host = params['script']['host']['value']
    port = params['script']['port']['value']
    user = params['script']['user']['value']
    password = params['script']['password']['value']
    index_name = params['script']['index']['value']
    text_key = params['script']['text_key']['value']
    dimension = params['script']['dimension']['value']
    if not dimension:
        dimension = 1024

    embeddings = inputs['embeddings']['value']
    documents = inputs['documents']['value']

    logger.info("To write to dingodb:")
    dingodb_writer = DingoDBWriter(host=host, port=port, user=user, password=password, embeddings=embeddings)
    results = dingodb_writer.exec(text_key=text_key, index_name=index_name, dimension=int(dimension),
                                  documents=documents)

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, results)

    return output
