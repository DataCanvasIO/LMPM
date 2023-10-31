from promptmanager.runtime.flow import PMNodeOutput
import logging

logger = logging.getLogger('pm_log')


class PMCustomScript:
    def __init__(self):
        pass

    def exec(self, inputs: dict = None):
        logger.info("To get the input of inputs value")

        input_value = inputs['input']['value']
        logger.info(input_value)

        logger.info("write your script here")

        result = input_value
        return result


def run(params: dict = None, inputs: dict = None, outputs=None) -> PMNodeOutput:
    logger.info("Welcome to Large Model Prompt Manager World!")
    logger.info("This is params info:")
    logger.info(params)
    logger.info("This is inputs info:")
    logger.info(inputs)
    logger.info("This is outputs info:")
    logger.info(outputs)

    custom_script = PMCustomScript()
    text = custom_script.exec(inputs)

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, text)

    return output
