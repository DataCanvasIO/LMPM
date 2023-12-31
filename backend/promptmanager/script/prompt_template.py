import logging

from promptmanager.runtime.flow import PMNodeOutput
from promptmanager.runtime.model import PMCustomLLM
from promptmanager.runtime.template import PMPromptTemplate

logger = logging.getLogger('pm_log')

class PromptTemplate(PMPromptTemplate):

    def __init__(self, template_content: str, role: str = 'user', role_prompt: str = None, prompt_variables: list[dict] = None,
                 model_conf: str = None, model_param_define: dict = None, model_params: list[dict] = None):
        self.template_content = template_content
        self.role_prompt = role_prompt
        self.prompt_variables = prompt_variables
        self.model_conf = model_conf
        self.model_param_define = model_param_define
        self.model_params = model_params
        self.role = role

    def exec(self) -> str:
        customLLM = PMCustomLLM.load_from_config(self.model_conf, self.model_param_define)
        prompt = PMPromptTemplate(role=self.role, template_content=self.template_content, role_prompt=self.role_prompt)
        result = customLLM.request_result_by_message(prompt.message(self.prompt_variables, True), self.model_params)
        return result

def run(params: dict = None, inputs: dict = None, outputs=None) -> PMNodeOutput:
    logger.info("Welcome to use Prompt Template!")
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
    logger.info("To get the messageRole from params:")
    role_name = params['script']['message_role']['value']
    logger.info(role_name)

    logger.info("To call AI model:")
    promptTemplate = PromptTemplate(template_content, role_name, role_prompt, prompt_variables, model_conf, model_param_define, model_params)
    result = promptTemplate.exec()

    logger.info(result)

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, result)

    return output
