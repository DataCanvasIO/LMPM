import React, { useEffect, useMemo } from 'react'
import { Modal, Form, Button, message } from 'antd'
import { useImmer } from 'use-immer'
import { getModelConfig, getParamsParse, saveModel, updateModel } from '@/services/aiModel'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import Step1Form from './step1'
import Step2orm from './step2'
import styles from '../index.less'

const { confirm } = Modal

const ModelAdd = (props) => {
  const { visible, isFlow, editId = '', editName = '', changeVisible, modelKey, saveModelData } = props
  const [form] = Form.useForm()
  const [state, setState] = useImmer({
    step: 0,
    isAdvanced: false,
    formData: {},
    parseFormData: [],
    loading: false,
  })

  const isOK = useMemo(() => {
    return state.step === 1 || (!state.isAdvanced && ['Alaya', 'OpenAI'].includes(modelKey))
  }, [state.step, state.isAdvanced, modelKey])

  useEffect(() => {
    if(visible) {
      setState((prev) => {
        prev.step = 0
      })
      if(editId) {
        getModelDetail(editId)
      } else {
        form.resetFields()
      }
    }
  }, [visible, form, editId])

  useEffect(() => {
    if((state.isAdvanced || modelKey === 'Others') && !editId && visible) {
      getModelCon()
    }
  }, [visible, state.isAdvanced, modelKey])

  const getModelDetail = async (editId) => {
    const res = await getModelConfig({id: editId})
    form.setFieldsValue({
      modelName: editName,
      connectConfigure: res.config
    })
  }

  const getModelCon = async () => {
    const res = await getModelConfig({type: modelKey})
    form.setFieldValue('connectConfigure', res.config)
  }

  const handleFormValues = (formValues) => {
    const params = []
    for(const [key,value] of Object.entries(formValues)) {
      if(!['connectConfigure', 'modelName', 'advancedConfigure'].includes(key) && !(key.indexOf('Default') > -1)) {
        params.push({
          name: key,
          type: value,
          defaultValue: value ? (value.indexOf('Json') > -1 ? (formValues[`${key}Default`] ? JSON.parse(formValues[`${key}Default`]) : {}) : formValues[`${key}Default`]) : '',
          value: null
        })
      }
    }
    return params
  }

  const handleOk = () => {
    form.validateFields(['modelName', 'connectConfigure']).then(() => {
      if(state.step === 1 || (!editId && !state.isAdvanced && ['Alaya', 'OpenAI'].includes(modelKey))) {
        form.validateFields().then(() => {
          if(isFlow && editId) {
            confirm({
              icon: <ExclamationCircleOutlined />,
              content: 'The modification will take effect on the flow that has already used this model, whether to continue',
              onOk() {
                saveModelForm()
              },
              okText: 'Continue',
              onCancel() {
                console.log('Cancel')
              },
            })
          } else {
            saveModelForm()
          }
        })
      } else {
        getModelParamsParse()
      }
    })
  }

  const saveModelForm = () => {
    if(isOK) {
      const formValues = form.getFieldsValue();
      let params = {
        name: formValues.modelName,
        config: formValues.connectConfigure,
      }
      params.params = handleFormValues(formValues)
      saveModelList(params)
    } else {
      return false;
    }
  }

  const saveModelList = async (params) => {
    let res = null
    if(editId) {
      params.id = editId
      res = await updateModel(params)
    } else {
      params.type = modelKey
      res = await saveModel(params)
    }
    if(res) {
      if(res.code !== 0) {
        message.error(res.data.message)
        // changeVisible()
      } else {
        saveModelData()
      }
    }
  }

  const getModelParamsParse = async () => {
    const config = form.getFieldValue('connectConfigure')
    const obj = { config }
    if(editId) {
      obj.id = editId
    } else {
      obj.type = modelKey
    }
    if(state.parseFormData.length > 0) {
      obj.params = state.parseFormData
    }
    setState((prev) => {
      prev.loading = true
    })
    const res = await getParamsParse(obj)
    setState((prev) => {
      prev.loading = false
      prev.step = 1
    })
    if(res && Array.isArray(res)) {
      const data = res.reduce((total, item) => {
        total[item.name] = item.type
        total[`${item.name}Default`] = item.type && item.type.indexOf('Json') > -1 ? JSON.stringify(item.defaultValue, null, 2) : item.defaultValue
        return total
      }, {})
      setState((prev) => {
        prev.formData = data
      })
      form.setFieldsValue(data)
    }
  }

  const onFieldsChange = (changeValues, allValues) => {
    const { advancedConfigure } = allValues
    const key = Object.keys(changeValues)[0]
    if(!key.indexOf('Detault') > -1) {
      if(changeValues[key] === 'Boolean') {
        form.setFieldValue(`${key}Default`, true)
      } else {
        form.setFieldValue(`${key}Default`, '')
      }
    }
    setState((prev) => {
      prev.isAdvanced = advancedConfigure === 'isAdvanced'
    })
  }

  const handleCancel = () => {
    if(state.step === 0) {
      changeVisible()
    } else {
      setState((prev) => {
        prev.parseFormData = handleFormValues(form.getFieldsValue())
      })
      setState((prev) => {
        prev.step = 0
      })
    }
  }

  const footerButton = () => {
    return (
      <>
        <Button onClick={handleCancel}>
          {state.step === 0 ? 'Cancel' : 'Previous'}
        </Button>
        <Button onClick={handleOk} type="primary" loading={!isOK && state.loading}>
          {isOK ? 'OK' : 'Next'}
        </Button>
      </>
    )
  }

  const resetAdvance = () => {
    // setState((prev) => {
    //   prev.isAdvanced = false;
    // })
    changeVisible()
  }

  return (
    <Modal
      footer={footerButton()}
      title={editId ? 'Edit Model' : 'Add Model'}
      open={visible}
      onCancel={resetAdvance}
      maskClosable={false}
      width={960}
    >
      <Form
        initialValues={{ modelName: '', advancedConfigure: 'notAdvanced' }}
        labelCol={{ span: 5 }}
        className={styles.formContainer}
        form={form}
        name="addModelForm"
        // onFinish={finishModelForm}
        onValuesChange={onFieldsChange}
      >
        <Step1Form
          editId={editId}
          modelKey={modelKey}
          style={{ display: state.step === 0 ? 'block' : 'none' }}
        />
        <Step2orm
          formData={state.formData}
          modelKey={modelKey}
          style={{ display: state.step === 1 ? 'block' : 'none' }}
        />
      </Form>
    </Modal>
  )
}

export default ModelAdd
