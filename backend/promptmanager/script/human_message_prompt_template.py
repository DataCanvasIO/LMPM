import logging

from promptmanager.runtime.flow import PMNodeOutput
from promptmanager.script.prompt_template import PromptTemplate

logger = logging.getLogger('pm_log')
class HumanMessagePromptTemplate(PromptTemplate):
    """Human message prompt template."""

def run(params: dict = None, inputs: dict = None, outputs=None) -> PMNodeOutput:
    logger.info("Welcome to use Human Message Prompt Template!")
    logger.info("This is params info:")
    logger.info(params)

    logger.info("To get the input of inputs value:")
    logger.info(inputs)

    logger.info("To get the prompt from params:")
    prompt_variables = [input for input in inputs.values()]
    template_content = params['prompt']
    logger.info(prompt_variables)

    logger.info("To get the AI model params from config and params:")
    if 'message' in params['model']:
        del params['model']['message']
    if 'result' in params['model']:
        del params['model']['result']
    model_params = [model_param for model_param in params['model'].values()]
    model_conf = params['model']['model_config']['value']
    model_param_define = params['model']['model_param_define']['value']
    logger.info(model_conf)
    logger.info(model_params)

    logger.info("To get the rolePrompt from params:")
    role_prompt = params['role']['rolePrompt']['value']
    logger.info(role_prompt)

    logger.info("To call AI model:")
    humanPromptTemplate = HumanMessagePromptTemplate(template_content, 'user', role_prompt, prompt_variables, model_conf, model_param_define, model_params)
    result = humanPromptTemplate.exec()

    logger.info(result)

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, result)

    return output