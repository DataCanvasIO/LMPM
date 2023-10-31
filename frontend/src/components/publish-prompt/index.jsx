import React, { useEffect, useRef } from 'react'
import { useImmer } from 'use-immer'
import { Modal, Form, Input, Select, Radio, Table, Typography, message } from 'antd'
import { getPromptList, addPrompt, updatePrompt, getCategoryList } from 'services/promptMarket'
import { parseTempVar, formMessage } from 'utils/variable'
import Role from '../role'
import { asyncName } from 'utils'
import styles from './index.less'

const initValue = {
  name: '',
  pro_id: '',
  promptVariables: [],
  scene_id: '',
  role_id: '',
  labels_ids: [],
  note: '',
}
const PublishPrompt = (props) => {
  const { prompt, handleModalVisible, visible } = props
  const [form] = Form.useForm()
  const [state, setState] = useImmer({
    promptList: [],
    // promptVariables: [],
    sceneList: [],
    labelList: [],
    roleList: [],
    type: 'add',
    addValues: {...initValue},
    updateValues: {...initValue},
  })

  const isFirstRender = useRef(true)
  const promptVariables = state.type === 'add' ? state.addValues.promptVariables : state.updateValues.promptVariables

  useEffect(() => {
    getPromptList({ pageIndex: 1, pageNum: 9999 }).then(res => {
      setState(draft => {
        draft.promptList = res.rows
      })
    })
    getCategoryList({ type: 'scene' }).then(res => {
      setState(draft => {
        draft.sceneList = res.rows || []
      })
    })
    getRoleList()
    getCategoryList({ type: 'label' }).then(res => {
      setState(draft => {
        draft.labelList = res.rows || []
      })
    })
  }, [])

  useEffect(() => {
    if (prompt) {
      form.setFieldsValue(prompt)
      const vs = prompt.prompt ? parseTempVar(prompt.prompt) : []
      // setState(draft => {
      //   draft.promptVariables = vs
      // })
      setValues({...prompt, promptVariables: vs}, 'add')
      setValues({...prompt, promptVariables: vs}, 'update')
    }
  }, [prompt])

  useEffect(() => {
    if (!isFirstRender.current) {
      const v = state.type === 'add' ? state.addValues : state.updateValues
      form.setFieldsValue(v)
    }
  }, [state.type])

  useEffect(() => {
    console.log(11)
    if (state.addValues.role_id && state.type === 'add') {
      console.log(state.roleList, state.addValues.role_id)
      const role_prompt = state.roleList.find(f => f.id === state.addValues.role_id)?.role_prompt
      if (role_prompt !== undefined) {
        form.setFieldsValue({ rolePrompt: role_prompt })
      }
    }
  }, [state.addValues.role_id, JSON.stringify(state.roleList), state.type])

  useEffect(() => {
    console.log(22)
    if (state.updateValues.role_id && state.type === 'update') {
      console.log(state.roleList, state.updateValues.role_id)
      const role_prompt = state.roleList.find(f => f.id === state.updateValues.role_id)?.role_prompt
      if (role_prompt !== undefined) {
        form.setFieldsValue({ rolePrompt: role_prompt })
      }
    }
  }, [state.updateValues.role_id, JSON.stringify(state.roleList), state.type])

  const setValues = (obj, type) => {
    if (type === 'add') {
      setState(draft => {
        draft.addValues = {...draft.addValues, ...obj}
      })
    } else {
      setState(draft => {
        draft.updateValues = {...draft.updateValues, ...obj}
      })
    }
  }

  const getRoleList = () => {
    getCategoryList({ type: 'role' }).then(res => {
      setState(draft => {
        draft.roleList = res.rows || []
      })
    })
  }

  const publishFn = () => {
    form.validateFields().then(res => {
      if (res) {
        const params = {
          name: res.publish_type === 'add' ? res.name : state.promptList.find(cur => cur.id === res.pro_id).name,
          scene_id: res.scene_id,
          role_id: res.role_id,
          labels_ids: res.labels_ids,
          prompt: res.prompt,
          variables: promptVariables,
          note: res.note
        }
        if (res.publish_type === 'add') {
          addPrompt(params).then(() => {
            message.success('Publish Success!')
            handleModalVisible(false)
          })
        } else {
          updatePrompt({ ...params, id: res.pro_id }).then(() => {
            message.success('Update Publish Success!')
            handleModalVisible(false)
          })
        }
      }
    })
  }

  const handleValuesChange = changeValues => {
    if (changeValues.publish_type) return;
    setValues({...changeValues}, state.type)
    if (changeValues.prompt !== undefined) {
      setValues({promptVariables: parseTempVar(changeValues.prompt)}, state.type)
    }
    if (changeValues.pro_id) {
      const currPro = state.promptList.find(f => f.id === changeValues.pro_id);
      setValues({
        labels_ids: currPro.labels_ids,
        scene_id: currPro.scene_id,
        note: currPro.note,
      }, state.type)
    }
  }

  const handleProChange = (v) => {
    const currPro = state.promptList.find(f => f.id === v);
    if (!currPro) {
      form.setFieldsValue({
        pro_id: null
      })
      return
    }
    const data = {
      labels_ids: currPro.labels_ids,
      scene_id: currPro.scene_id,
      note: currPro.note,
    }
    if (isFirstRender.current) {
      setValues(data, state.type)
    }
    setTimeout(() => {
      form.setFieldsValue(data)
    }, 0)
  }

  const handleTypeChange = (e) => {
    setState(draft => {
      draft.type = e.target.value;
    })
  }

  const handleOk = () => {
		publishFn()
  }

  const onAddRole = (data) => {
    getRoleList()
    setValues({ role_id: data.role_id }, state.type)
    setTimeout(() => {
      form.setFieldsValue(data)
    }, 0)
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
      title="Publish Prompt"
      onOk={handleOk}
      open={visible}
      onCancel={() => handleModalVisible(false)}
      maskClosable={false}
      destroyOnClose
      width={960}
      cancelText="Cancel"
      okText="OK"
    >
      <Form
        form={form}
        onValuesChange={handleValuesChange}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
        initialValues={{ publish_type: 'add' }}
      >
        <Form.Item name="publish_type" label="" wrapperCol={{ offset: 6, span: 14 }}>
          <Radio.Group onChange={handleTypeChange}>
            <Radio value="add">New prompt</Radio>
            <Radio value="update">Update prompt</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.publish_type !== curValues.publish_type}>
          {({ getFieldValue }) => {
            const publish_type = getFieldValue('publish_type')
            if (publish_type === 'add') {
              return (
                <Form.Item name="name" rules={
                  [
                    { required: true, message: formMessage.required },
                    asyncName(`/prompt/name/check?name=`)
                  ]}
                  label="Prompt Name">
                  <Input placeholder="Please input something." autocomplete='off' width="280" />
                </Form.Item>
              )
            }
            if (isFirstRender.current) {
              handleProChange(prompt.pro_id)
              isFirstRender.current = false
            }
            return (
              <Form.Item name="pro_id" rules={[{ required: true, message: formMessage.required }]} label="Prompt Name">
                <Select
                  getPopupContainer={triggerNode => triggerNode.parentElement}
                  placeholder='Select Prompt'
                  showSearch
                  width="280px"
                  onChange={handleProChange}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={state.promptList.map(item => ({ label: item.name, value: item.id }))}
                />
              </Form.Item>
            )
          }}
        </Form.Item>
        <Form.Item name="prompt" rules={[{ required: true, message: formMessage.required }]} label='Prompt'>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 3 }}
            placeholder="New prompt (Use '${variable}' to define variables and '${variable}[file]' to upload a file. Use '${variable:xxxx}' to assign default values to variables.)"
          />
        </Form.Item>
        <Form.Item label="Variables" className={styles.formTableTit}>
          <Table
            columns={columns}
            dataSource={promptVariables}
            pagination={false}
            scroll={{ x: false, y: 390 }}
          />
        </Form.Item>
        <Form.Item name="scene_id" rules={[{ required: true, message: formMessage.required }]} label='Scene'>
          <Select getPopupContainer={triggerNode => triggerNode.parentElement} options={state.sceneList} fieldNames={{ label: 'name', value: 'id' }} />
        </Form.Item>
        <Role formInstance={form} onAddRole={onAddRole} labelName="Role" name="role_id" wrapperCol={{ offset: 0, span: 14 }} hasRolePrompt />
        <Form.Item name="labels_ids" label='Label' className={styles.multSelect}>
          <Select optionFilterProp="name" getPopupContainer={triggerNode => triggerNode.parentElement} mode="multiple" options={state.labelList} fieldNames={{ label: 'name', value: 'id' }} />
        </Form.Item>
        <Form.Item name="note" label='Note'>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 3 }} placeholder="Input something" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PublishPrompt
