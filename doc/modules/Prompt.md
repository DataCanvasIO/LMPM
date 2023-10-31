# Prompt

The new way of programming models is through prompts. A **prompt** refers to the input to the model. This input is often constructed from multiple components. Prompt Manager provides web application ,and  several python SDK functions to make constructing and working with prompts easy.

## Prompt Scene

In web UI prompt template can by Classification  A Scene in order to Classification and retrieval;

## Prompt Role

Prompt Role is tell the large language model to be acted a role

```python
from promptmanager.runtime.template import PMPromptTemplate
role_prompt = "i am role_prompt"
prompt_template = PMPromptTemplate("user","Tell me a ${adjective} joke about ${content}.",role_prompt)

```

## Prompt Label

In web UI prompt template can by tag by many different label in order to Classification and retrieval;

## Prompt Variable

We can define A variable in the prompt template like this:

```
${<varname>[<vartype>]:<defaultValue>}
```

Variable type [vartype] is not required and default value is [text] ,And the default value of the variable is not required ;

For example:

```tex
${title}

${title [text]}

${title [text]}

${title: xxxx}

```

Prompt Manger Support file of vartype:

```tex
${file [file]: science fiction novel}

There are two types of [vartype]: text/file; The default is text;

${title [file]:/xxxxx/xxxxxjife/xx.csv}
```



## Prompt Template	

```python
from promptmanager.runtime.template import PMPromptTemplate
role_prompt = "i am role_prompt"
prompt_template = PMPromptTemplate("user","Tell me a ${adjective} joke about ${content}.",role_prompt)

variables={
            "adjective":"funny",
    		"content":"chickens"
          }

prompt_template.message(variables)
```

You can get variable info

```python
prompt_template.show_variables_info()
```

