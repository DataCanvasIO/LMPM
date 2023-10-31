import React, { useEffect } from 'react'
import { Modal, Input, Form, Select, Typography, Table } from 'antd'
import { useImmer } from 'use-immer'
import { asyncName } from 'utils'
import { parseTempVar, formMessage } from 'utils/variable'
import { addPrompt, updatePrompt, getCategoryList } from 'services/promptMarket'
import styles from './index.less'

const NewModal = (props) => {
  const [form] = Form.useForm()
  const { newOpen, closeModal, initValue } = props
  const [state, setState] = useImmer({
    variablesData: [],
    sceneList: [],
    roleList: [],
    labelList: []
  })

  useEffect(() => {
    if(initValue) {
      form.setFieldsValue(initValue)
      setState(draft => {
        draft.variablesData = initValue.variables
      })
    }
  }, [initValue])

  useEffect(() => {
    getCategoryList({ type: 'scene' }).then(res => {
      setState(draft => {
        draft.sceneList = res.rows || []
      })
    })
    getCategoryList({ type: 'role' }).then(res => {
      setState(draft => {
        draft.roleList = res.rows || []
      })
    })
    getCategoryList({ type: 'label' }).then(res => {
      setState(draft => {
        draft.labelList = res.rows || []
      })
    })
  }, [])

  const onOk = () => {
    form.validateFields().then(values => {
      if(initValue) {
        updatePrompt({ ...values, variables: state.variablesData, id: initValue.id }).then((res) => {
          if (res) {
            closeModal('update')
          }
        })
      } else {
        addPrompt({ ...values, variables: state.variablesData }).then(res => {
          if (res) {
            closeModal('update')
          }
        })
      }
    })
  }

  const onValuesChange = (changeValues) => {
    if (changeValues.prompt !== undefined) {
      const varList = parseTempVar(changeValues.prompt)
      setState(draft => {
        draft.variablesData = varList
      })
    }
  }

  const columns = [
    {
      title: 'Variable',
      dataIndex: 'name',
      key: 'variable',
      render: _ => <Typography.Text style={{ whiteSpace: 'pre' }} ellipsis={{ rows: 1,  tooltip: _ }} >{_}</Typography.Text>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Default',
      dataIndex: 'defaultValue',
      key: 'value',
      render: _ => <Typography.Text style={{ whiteSpace: 'pre' }} ellipsis={{ rows: 1,  tooltip: _ ? _ : '--' }} >{_ ? _ : '--'}</Typography.Text>
    },
  ]

  return (
    <Modal
      key='new'
      title={initValue ? 'Edit Prompt' : 'New Prompt'}
      open={newOpen}
      onOk={onOk}
      onCancel={() => { closeModal() }}
      maskClosable={false}
      destroyOnClose
      width={960}
      cancelText="Cancel"
      okText="OK"
    >
      <Form form={form} onValuesChange={onValuesChange} labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} labelAlign="right">
        <Form.Item
          name="name"
          rules={[
            { required: true, message: formMessage.required },
            { pattern: "^[^/]*$", message: "Prompt Name does not support the special character '/' !" },
            asyncName(`/prompt/name/check?name=`, initValue?.name || '')
          ]}
          label='Prompt Name'
        >
          <Input autocomplete='off' placeholder='New prompt name' />
        </Form.Item>
        <Form.Item name="prompt" rules={[{ required: true, message: formMessage.required }]} label='Prompt'>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 3 }} placeholder="New prompt (Use '${variable}' to define variables and '${variable[file]}' to upload a file. Use '${variable:xxxx}' to assign default values to variables.)" />
        </Form.Item>
        <Form.Item label="Variables" className={styles.formTableTit}>
          <Table
            columns={columns}
            dataSource={state.variablesData}
            pagination={false}
            scroll={{ x: false, y: 390 }}
          />
        </Form.Item>
        <Form.Item name="scene_id" rules={[{ required: true, message: formMessage.required }]} label='Scene'>
          <Select getPopupContainer={triggerNode => triggerNode.parentElement} options={state.sceneList} fieldNames={{ label: 'name', value: 'id' }} />
        </Form.Item>
        <Form.Item name="role_id" rules={[{ required: true, message: formMessage.required }]} label='Role'>
          <Select getPopupContainer={triggerNode => triggerNode.parentElement} options={state.roleList} fieldNames={{ label: 'name', value: 'id' }} />
        </Form.Item>
        <Form.Item name="labels_ids" label='Label' className={styles.multSelect}>
          <Select getPopupContainer={triggerNode => triggerNode.parentElement} mode="multiple" options={state.labelList} fieldNames={{ label: 'name', value: 'id' }} />{/* maxTagCount="responsive" */}
        </Form.Item>
        <Form.Item name="note" label='Note'>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 3 }} placeholder="Input something" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default NewModal
