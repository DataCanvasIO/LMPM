import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useImmer } from 'use-immer'
import { Form, Input, Select, Divider, Button } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import { getCategoryList, addCategory } from 'services/promptMarket'
import { asyncName } from 'utils'
import { formMessage } from 'utils/variable'
import styles from './index.less'

const { TextArea } = Input

const Role = forwardRef((props, ref) => {
  const inputRef = useRef(null)
  const [form] = Form.useForm()
  const { formInstance, hasRolePrompt = false, name = 'roleName', labelName = null, wrapperCol = null, onAddRole } = props
  const [state, setState] = useImmer({
    roleList: [],
    role: '',
    roleDes: '',
    step: 0,
  })

  const queryRoleList = async () => {
    const res = await getCategoryList({ type: 'role' })
    if (res && res.rows) {
      setState(draft => {
        draft.roleList = res.rows
      })
    }
  }

  const onDesChange = e => {
    setState(draft => {
      draft.roleDes = e.target.value
    })
  }

  const onNameChange = e => {
    setState(draft => {
      draft.role = e.target.value
    })
  }

  const findCurrRole = (id) => state.roleList.find(cur => cur.id === id)

  const addItem = () => {
    form.validateFields().then(async res => {
      if (res) {
        const result = await addCategory({
          name: res.rolenameCreate,
          role_prompt: res.rolepromptCreate,
          type: 'role'
        })
        if (result) {
          onAddRole && onAddRole({
            role_id: result,
            rolePrompt: res.rolepromptCreate,
          })
          setState(draft => {
            draft.step = 0
          })
          form && form.setFieldsValue({
            rolenameCreate: '',
            rolepromptCreate: '',
          })
          queryRoleList()
        }
      }
    })
  }

  const handleRoleChange = (value) => {
    const curr = state.roleList.find(cur => cur.id === value)
    formInstance && formInstance.setFieldsValue({
      rolePrompt: curr.role_prompt
    })
  }

  const goback = () => {
    setState(draft => {
      draft.step = 0
    })
  }

  const add = () => {
    setState(draft => {
      draft.step = 1
    })
  }

  useImperativeHandle(ref, () => ({
    findCurrRole,
  }), [state.roleList])

  useEffect(() => {
    queryRoleList()
  }, [])

  return (
    <>
      <Form.Item
        name={name}
        rules={[{ required: true, message: formMessage.required }]}
        label={labelName}
        wrapperCol={wrapperCol}
      >
        <Select
          getPopupContainer={triggerNode => triggerNode.parentElement}
          placeholder="please select a role"
          onChange={handleRoleChange}
          dropdownRender={menu => (
            <>
              {state.step === 0 && (
                <div className={styles.stepOne}>
                  {menu}
                  {/* <Divider style={{ margin: '8px 0' }} /> */}
                  <div onClick={add} className={styles.add}><PlusCircleOutlined /> Add</div>
                </div>
              )}
              {
                state.step === 1 && <div className={styles.stepTwo}>
                  <div onClick={goback} className={styles.back}>{'<'} Back</div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 12px'}}>
                    <Form layout="vertical" form={form}>
                      <Form.Item name="rolenameCreate" rules={[
                        { required: true, message: formMessage.required },
                          asyncName(`/prompt/category/name/check?type=role&name=`)
                        ]} labelAlign="" label="Role Name:">
                        <Input autocomplete='off' placeholder="Please Enter" ref={inputRef} value={state.role} onChange={onNameChange} />
                      </Form.Item>
                      <Form.Item name="rolepromptCreate" rules={[{ required: true, message: formMessage.required }]} label="Role Prompt:">
                        <TextArea placeholder="Please Enter" value={state.roleDes} onChange={onDesChange} />
                      </Form.Item>
                    </Form>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <Button type="primary" onClick={addItem} style={{ float: 'right', margin: '0 12px 6px 0' }}>
                    submit
                  </Button>
                </div>
              }
            </>
          )}
          options={state.roleList.map(item => ({ label: item.name, value: item.id }))}
        />
      </Form.Item >
      {hasRolePrompt && (
        <Form.Item
          name="rolePrompt"
          // rules={[{ required: true, message: formMessage.required }]}
          label="rolePrompt"
          wrapperCol={wrapperCol}
          className={styles.hideLabel}>
          <TextArea placeholder="" autoSize={{ minRows: 3, maxRows: 30 }} disabled />
        </Form.Item>
      )}
    </>
  )
})

export default Role
