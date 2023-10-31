import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useImmer } from 'use-immer'
import { Form, Input, Select, Divider, Space, Button } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import { getCategoryList, addCategory } from 'services/promptMarket'
import { formMessage } from 'utils/variable'
import styles from './index.less'

const { TextArea } = Input

const Role = forwardRef((props, ref) => {
  const [form] = Form.useForm()
  const inputRef = useRef(null)
  const { formInstance, hasRolePrompt = false } = props
  const [state, setState] = useImmer({
    roleList: [],
    role: '',
    roleDes: '',
    step: 0,
  })
  const { step, roleList } = state

  const queryRoleList = async () => {
    const res = await getCategoryList({ type: 'role'})
    if (res && res.rows) {
      setState(d => {d.roleList = res.rows})
    }
  }

  const onDesChange = (e) => {
    setState(d => {
      d.roleDes = e.target.value
    })
  }

  const onNameChange = (e) => {
    setState(d => {
      d.role = e.target.value
    })
  }

  const findCurrRole = (id) => {
    return roleList.find(f => f.id === id)
  }

  const addItem = () => {
    //  query success
    form.validateFields().then(async res => {
      if (res) {
        const p = {
          name: res.rolenameCreate,
          role_prompt: res.rolepromptCreate,
          type: 'role'
        }
        const result = await addCategory(p)
        if (result) {
          setState(d => {d.step = 0})
          queryRoleList()
        }
      }
    })
  }

  const handleRoleChange = (v) => {
    const curr =  state.roleList.find(f => f.id === v)
    formInstance.setFieldsValue({
      rolePrompt: curr.role_prompt
    })
  }

  const goback = () => {
    setState(d => {
      d.step = 0
    })
  }

  const add = () => {
    setState(d => {
      d.step = 1
    })
  }

  const handleValueChange = (values) => {

  }

  useImperativeHandle(ref, () => {
    return {
      findCurrRole,
    }
  }, [roleList])

  useEffect(() => {
    queryRoleList()
  }, [])

  return <Form.Item style={{ marginBottom: 0 }}>
    <Form.Item
      name="roleName"
      rules={[{ required: true, message: formMessage.required }]}
    >
      <Select
        getPopupContainer={triggerNode => triggerNode.parentElement}
        placeholder="custom dropdown render"
        onChange={handleRoleChange}
        dropdownRender={menu => (
          <>
            {
              step === 0 && <div className={styles.stepOne}>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <div onClick={add} className={styles.add}><PlusCircleOutlined /> Add</div>
              </div>
            }
            {
              step === 1 && <div className={styles.stepTwo}>
                <div onClick={goback} className={styles.back}>{'<'} Back</div>
                <Divider style={{ margin: '8px 0' }} />
                <Form
                    // onValuesChange={handleValueChange}
                    layout="vertical"
                    form={form}
                >
                  <Form.Item
                    name="rolenameCreate"
                    rules={[{ required: true, message: formMessage.required }]}
                    labelAlign=""
                    label="Role Name"
                  >
                      <Input
                        placeholder="Please enter item"
                        ref={inputRef}
                        value={state.role}
                        onChange={onNameChange}
                      />
                  </Form.Item>
                  <Form.Item
                    name="rolepromptCreate"
                    rules={[{ required: true, message: formMessage.required }]}
                    label="Role Prompt"
                  >
                    <TextArea
                      placeholder="Please enter item"
                      value={state.roleDes}
                      onChange={onDesChange}
                    />
                  </Form.Item>
                  <Button type="primary" onClick={addItem} style={{ float: 'right', marginBottom: 12 }}>
                    submit
                  </Button>
                </Form>
              </div>
            }
          </>
        )}
        options={state.roleList.map(item => ({ label: item.name, value: item.id }))}
      />
    </Form.Item>
    {hasRolePrompt && <Form.Item
      name="rolePrompt"
      rules={[{ required: true, message: formMessage.required }]}
    >
      <TextArea placeholder=""  disabled/>
    </Form.Item>}
  </Form.Item>
})


export default Role
