import logging
import os

from promptmanager.runtime.flow import PMNodeOutput
from promptmanager.script.embeddings.openai_embeddings import PMOpenAIEmbeddings

logger = logging.getLogger('pm_log')


def run(params: dict, inputs: dict, outputs: dict) -> PMNodeOutput:
    logger.info("Welcome to Use OpenAI Embeddings!")

    logger.info("This is params info:")
    logger.info(params)
    logger.info("This is inputs info:")
    logger.info(inputs)
    logger.info("This is outputs info:")
    logger.info(outputs)

    openai_key = params['script']['openai_key']['value']

    os.environ["OPENAI_API_KEY"] = openai_key
    model_proxy = os.getenv('MODEL_PROXY') if os.getenv('MODEL_PROXY') is not None else None
    if model_proxy:
        os.environ["OPENAI_PROXY"] = model_proxy

    embeddings = PMOpenAIEmbeddings()
    results = embeddings

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, results)

    return output
