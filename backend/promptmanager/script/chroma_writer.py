import logging

import uuid

import chromadb
from chromadb.api.models import Collection
from chromadb.utils import embedding_functions

from promptmanager.runtime.flow import PMNodeOutput

from promptmanager.script.schema.document import PMDocument

logger = logging.getLogger('pm_log')


class ChromaWriter:
    def __init__(self, connection_type, host=None, port=None, collection=None):
        self.connection_type = connection_type
        self.host = host
        self.port = port
        self.collection = collection

    def exec(self, documents: list[PMDocument] = None) -> Collection:

        if self.connection_type == 'local':
            # local chromadb
            persistent_client = chromadb.PersistentClient()
            collection = persistent_client.get_or_create_collection(self.collection)
        else:
            # remote chromadb
            client = chromadb.HttpClient(host=self.host, port=self.port)
            emb_fn = embedding_functions.ONNXMiniLM_L6_V2()
            try:
                collection = client.create_collection(name=self.collection, embedding_function=emb_fn)
            except Exception:
                collection = client.get_collection(name=self.collection, embedding_function=emb_fn)

        # split it into chunks
        from promptmanager.script.text_splitter import CharacterTextSplitter
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        docs = text_splitter.split_documents(documents)

        # add documents
        for doc in docs:
            collection.add(
                ids=[str(uuid.uuid1())], metadatas=doc.metadata, documents=doc.page_content
            )

        return collection


def run(params: dict, inputs: dict, outputs: dict) -> PMNodeOutput:
    logger.info("Welcome to Use Chroma Writer!")

    logger.info("This is params info:")
    logger.info(params)
    logger.info("This is inputs info:")
    logger.info(inputs)
    logger.info("This is outputs info:")
    logger.info(outputs)

    connection_type = params['script']['connection_type']['value']
    host = params['script']['host']['value']
    port = params['script']['port']['value']
    collection = params['script']['collection']['value']

    documents = inputs['documents']['value']

    logger.info("To write from chroma db:")
    chroma_writer = ChromaWriter(connection_type=connection_type, host=host, port=port, collection=collection)
    results = chroma_writer.exec(documents=documents)

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, results)

    return output


if __name__ == '__main__':
    client = chromadb.HttpClient(host='172.20.52.122', port='8000')
    emb_fn = embedding_functions.ONNXMiniLM_L6_V2()
    try:
        collection = client.create_collection(name='my_collection', embedding_function=emb_fn)
    except Exception:
        collection = client.get_collection(name='my_collection', embedding_function=emb_fn)

    collection.add(ids=['id1', 'id2'], documents=['aaaa', 'bbbb'])
    print('finish')

    results = collection.query(
        query_texts=['aaa'],
        n_results=int(10)
    )
    print(results)
