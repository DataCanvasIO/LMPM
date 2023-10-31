# Prompt Manager
How can people use large language models more accurately?

![image](https://github.com/DataCanvasIO/LMPM/assets/62921331/b9cfac8a-be6e-4865-9639-39ee3de685eb)


## Introduction

**Prompt Manager** The design and construction tool for large model prompt words guides users to generate more accurate, reliable, and expected output content by helping them design better prompt words. This tool can provide SDK development modes for both technical personnel and non-technical personnel, as well as interface interaction operation modes to meet the needs of different populations using large models. The main functions include model service management, scenario management, prompt word template management, prompt word development, and prompt word application. The specific features are as follows:

. Support docking with commonly used large language models, including OpenAl's GPT model and other open source or custom large language model access interfaces; Support the management of prompt word templates, scene and role management, preset commonly used prompt templates, including Zero shot, One shot, Few shot, COT, etc. Support interaction with the model through dialogue, and can develop prompt words during the dialogue process

. Supports the construction, organization, and operation of prompt workflows, and supports publishing prompt engineering workflows as prompt word applications

Reminder workflow supports customizable Python scripts to prompt personalized requirements for engineering business

Reminder workflows support docking with commonly used vector databases, such as Dingo-DB, Chroma, FAISS, etc. Reminder workflows preset commonly used toolkits, including text segmentation, text segmentation, text conversion, etc

Support publishing prompt workflows as prompt word applications, accessed through the HTTP interface, and exporting the application as an SDK

The prompt word engineering tool supports running in SDK mode and can be quickly integrated into the development environment to help developers complete the construction and use of the prompt word engineering

![image](https://github.com/DataCanvasIO/LMPM/assets/62921331/fe5014df-b9ad-404a-aae3-3ec213a2482c)



### Modules

#### Prompt Template

The new way of programming models is through prompts. A **prompt** refers to the input to the model. This input is often constructed from multiple components. Prompt Manager provides web application ,and  several python SDK functions to make constructing and working with prompts easy.

#### Large AI Model

Large AI Models of Prompt Manager is support  to custom with many different Large AI Models  by using json config file. and We also provide a preset OpenAI Large Language Models for easy use;

#### Prompt engineering 

- Chat  : We can have a conversation with the LLM through prompt template;
- Flow : To achieve complex business logic; I can build a workflow of the Prompt engineering to achieve a more complex and more practical business logic based workflow interacting with LLM;

#### Prompt Application

Prompt Application is a service for prompt flow ;
We can publish a prompt flow to a prompt App,then we can  run the flow on server at anywhere by http api;

## Installation

To install Prompt Manager run

### pip install

```shell
pip install promptmanager
```

## Service management

### service start

```shell
pmctl service start
```

Open Web browser with this URL http://<your ip address>:9999/

### service start with a port

```
pmctl service start -port 10000
```

### service stop

```
pmctl service stop
```


