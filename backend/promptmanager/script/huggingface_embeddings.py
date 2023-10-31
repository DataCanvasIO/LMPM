import logging

from promptmanager.runtime.common_util import PMCommonUtil
from promptmanager.runtime.flow import PMNodeOutput
from promptmanager.script.embeddings.huggingface_embeddings import PMHuggingFaceEmbeddings

logger = logging.getLogger('pm_log')


def run(params: dict, inputs: dict, outputs: dict) -> PMNodeOutput:
    logger.info("Welcome to Use HuggingFace Embeddings!")

    logger.info("This is params info:")
    logger.info(params)
    logger.info("This is inputs info:")
    logger.info(inputs)
    logger.info("This is outputs info:")
    logger.info(outputs)

    model_name = params['script']['model_name']['value']
    if not model_name:
        from promptmanager.script.embeddings.huggingface_embeddings import DEFAULT_MODEL_NAME
        model_name = DEFAULT_MODEL_NAME

    model_kwargs = params['script']['model_kwargs']['value']
    if model_kwargs:
        model_kwargs = PMCommonUtil.json_to_dict(model_kwargs)

    embeddings = PMHuggingFaceEmbeddings(model_name=model_name, model_kwargs=model_kwargs)
    results = embeddings

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, results)

    return output
