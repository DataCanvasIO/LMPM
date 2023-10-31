import logging

from promptmanager.runtime.flow import PMNodeOutput
from promptmanager.runtime.model import PMCustomLLM
from promptmanager.runtime.template import PMPromptTemplate, PMChatPromptTemplate

logger = logging.getLogger('pm_log')

class ChatPromptTemplate(PMChatPromptTemplate):

    def __init__(self, template_content, role: str = 'user', role_prompt: str = None, prompt_variables: list[dict] = None,
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
        prompts = []
        prompt = {'role': 'user'}
        if self.template_content:
            try:
                #默认格式为[{"role":"user","prompt":"我是prompt1,变量${var1}"},{"role":"user","prompt":"我是prompt2,变量${var2}"}]
                prompts = eval(self.template_content)
            except Exception:
                prompt['prompt'] = self.template_content
                prompts.append(prompt)
        else:
            prompt['prompt'] = ''
            prompts.append(prompt)

        pmTemplateList = []
        for pm in prompts:
            prompt = PMPromptTemplate(role=pm['role'], template_content=pm['prompt'], role_prompt=self.role_prompt)
            pmTemplateList.append(prompt)

        chatPromptTemplate = PMChatPromptTemplate(pmTemplateList)
        result = customLLM.request_result_by_message(chatPromptTemplate.messages(self.prompt_variables, True), self.model_params)
        return result

def run(params: dict = None, inputs: dict = None, outputs=None) -> PMNodeOutput:
    logger.info("Welcome to use Chat Prompt Template!")
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
    role_name = params['role']['roleName']['value']
    logger.info(role_prompt)

    logger.info("To call AI model:")
    promptTemplate = ChatPromptTemplate(template_content, role_name, role_prompt, prompt_variables, model_conf, model_param_define, model_params)
    result = promptTemplate.exec()

    logger.info(result)

    output = PMNodeOutput()
    for output_name in outputs.keys():
        output.add_output(output_name, result)

    return output
