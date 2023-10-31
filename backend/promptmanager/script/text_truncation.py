from promptmanager.runtime.flow import PMNodeOutput
import logging


class TextTruncation:
    def __int__(self):
        pass

    def exec(self, max_length, text: str) -> str:
        max_length = int(max_length)
        split_len = max_length if max_length <= len(text) else len(text)
        return text[0:split_len:]


def run(params: dict = None, inputs: dict = None, outputs=None) -> PMNodeOutput:
    logger = logging.getLogger('pm_log')
    logger.info("This is params info:")
    logger.info(params)
    logger.info("This is inputs info:")
    logger.info(inputs)
    logger.info("This is outputs info:")
    logger.info(outputs)

    logger.info("To run text truncation:")

    max_length = params['script']['max_length']['value']
    text = inputs['input']['value']

    text_truncation = TextTruncation()
    result = text_truncation.exec(max_length, text)

    logger.info(result)

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, result)

    return output
