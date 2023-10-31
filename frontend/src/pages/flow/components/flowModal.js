import React, { useEffect, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import { asyncName } from '../../../utils'
import { Modal, Form, Input, Select, Radio, message } from 'antd'
import { createFlow, copyFlow, publishFlow, getAppList } from '../../../services/flow'
import styles from './index.less'

const formLayout = {
  labelCol:{ span: 8 },
  wrapperCol: { span: 12 }
}
const { TextArea } = Input

const FlowModal = (props) => {
  const [form] = Form.useForm()
  const { modalType = 'create', currData, handleModalVisible, queryList, onSuccess } = props
  const [state, setState] = useImmer({
    publishType: 'add',
    appList: []
  })

  const queryApp = () => {
    getAppList({
      pageIndex: 1,
      pageNum: 9999
    }).then(res => {
      setState(d => {
        d.appList = res.rows
      })
    })
  }

  const handleSetData = () => {
    if (modalType === 'edit') {
      form.setFieldsValue({
        ...currData
      })
    }
    if (modalType === 'copy') {
      form.setFieldsValue({
        name: `${currData.name}-copy`
      })
    }
  }

  const createFn = () => {
    form.validateFields().then(res => {
      if (res) {
        createFlow({...res}).then(res => {
          if (res) {
            handleModalVisible(false)
            queryList && queryList()
            message.success('create success')
          }
        })
      }
    })
  }

  const copyFn = () => {
    form.validateFields().then(res => {
      if (res) {
        copyFlow({
          source_id: currData.id,
          target_name: res.name
        }).then(res => {
          handleModalVisible(false)
          message.success('Copy successful!')
          queryList && queryList()
        })
      }
    })
  }

  const publishFn = () => {
    form.validateFields().then(res => {
      if (res) {
        publishFlow({ ...res, publish_type: state.publishType,flow_id: currData.id }).then(res => {
          handleModalVisible(false)
          message.success('publish success')
          queryList && queryList()
          onSuccess && onSuccess()
        })
      }
    })
  }

  const renderCreate = () => {
    return (
      <>
        <Form form={form} {...formLayout}>
          <Form.Item
            name="name"
            key="Flow name"
            rules={[
              { required: true, message: `Please input something.` },
              asyncName(`/flow/name/check?name=`)
            ]}
            label="Flow name"
          >
            <Input autocomplete='off' placeholder="Input flow name" />
          </Form.Item>
          <Form.Item
            name="description"
            key="Description"
            rules={[{ required: true, message: `Please input something.` }]}
            label="Flow description"
          >
            <TextArea placeholder={`Descript the flow`} autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
        </Form>
      </>
    )
  }

  const renderCopy = () => {
    return (
      <>
        <Form form={form} {...formLayout}>
          <Form.Item
            name="name"
            key="New flow name"
            rules={[
              { required: true, message: `Please input something.` },
              asyncName(`/flow/name/check?name=`,)
            ]}
            label="New flow name"
          >
            <Input autocomplete='off' placeholder="Input new flow name" width="280" />
          </Form.Item>
        </Form>
      </>
    )
  }

  const handleRadioChange = (e) => {
    setState(d => {
      d.publishType = e.target.value
    })
  }

  const renderPublish = () => {
    return <>
      <Form form={form} {...formLayout}>
        <Form.Item
          name="publish_type"
          key="publish_type"
          label=""
          wrapperCol={{ offset: 8, span: 12 }}
        >
          <Radio.Group onChange={handleRadioChange} value={state.publishType} defaultValue='add'>
            <Radio value="add">New app</Radio>
            <Radio value="update">Update app</Radio>
          </Radio.Group>
        </Form.Item>
        {state.publishType === 'add' && (
          <Form.Item
            name="app_name"
            key="app_name"
            rules={[
              { required: true, message: "Please input something." },
              asyncName(`/app/name/check?name=`)
            ]}
            label="App name"
          >
            <Input autocomplete='off' placeholder="Input app name" width="280" />
          </Form.Item>
        )}
        {state.publishType === 'update' && (
          <Form.Item
            name="app_id"
            key="app_id"
            rules={[{ required: true, message: "Please input something." }]}
            label="App"
          >
            <Select
              getPopupContainer={triggerNode => triggerNode.parentElement}
              placeholder="Select app"
              showSearch
              width="280"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={state.appList.map(item => ({ label: item.name, value: item.id }))}
            />
          </Form.Item>
        )}
        <div style={{visibility: 'hidden', height: 200}}></div>
      </Form>
    </>
  }

  const handleOk = () => {
    switch (modalType) {
      case 'create':
        createFn()
        break
      case 'edit':
        createFn()
        break
      case 'copy':
        copyFn()
        break
      case 'publish':
        publishFn()
        break
    }
  }

  let content = null
  let title = null

  switch (modalType) {
    case 'create':
      title = 'New Flow'
      content = renderCreate()
      break
    case 'edit':
      title = 'Edit'
      content = renderCreate()
      break
    case 'copy':
      title = 'Copy'
      content = renderCopy()
      break
    case 'publish':
      title = 'Publish'
      content = renderPublish()
      break
    default:
      title = 'Create'
			content = renderCreate()
      break
  }

  useEffect(() => {
    handleSetData()
  }, [modalType])

  useEffect(() => {
    if (state.publishType === 'update') {
      queryApp()
    }
  }, [state.publishType])

  return (
    <Modal
      title={title}
      onOk={handleOk}
      open={props.visible}
      onCancel={() => handleModalVisible(false)}
      maskClosable={false}
      destroyOnClose
      width={640}
      cancelText="Cancel"
      okText="OK"
    >
      <div className={styles.flowModal}>
        {content}
      </div>
    </Modal>
  )
}



export default FlowModal
