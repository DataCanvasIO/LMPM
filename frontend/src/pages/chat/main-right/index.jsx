import React, { forwardRef, useImperativeHandle, useEffect } from 'react'
import { Input, Form, Select, InputNumber } from 'antd'
import { getModelList } from 'services/chat'
import { useImmer } from 'use-immer'
import { jsonValidator } from 'utils/variable'
import styles from './index.less'

const DrawerForm = (props, ref) => {
  const { form } = props
  const [state, setState] = useImmer({
    selectModel: undefined,
    modelList: [],
  })

  useImperativeHandle(ref, () => ({
    getData: () => {
      try {
        const values = form.getFieldsValue()
        const configParams = state.modelList.find(cur => cur.id === values.model)?.params.map(cur => {
          if (['json', 'jsonarray'].includes(cur.type)) {
            return { ...cur, value: JSON.parse(values.params[cur.name]) }
          }
          return { ...cur, value: values.params[cur.name] }
        })
        return {
          model_name: state.modelList.find(cur => cur.id === values.model).name,
          config: state.modelList.find(cur => cur.id === values.model).config,
          params_define: state.modelList.find(cur => cur.id === values.model).params_define,
          model_params: configParams
        }
      } catch {
        return {}
      }
    },
  }))

  useEffect(() => {
    getModelList().then(res => {
      setState(draft => {
        draft.modelList = res.rows
      })
    })
  }, [])

  useEffect(() => {
    if (state.modelList.length > 0) {
      form.setFieldsValue({ model: state.modelList.find(cur => cur.is_default)?.id || state.modelList[0].id })
      onValuesChange({ model: state.modelList.find(cur => cur.is_default)?.id || state.modelList[0].id })
    }
  }, [state.modelList])

  // 监听表单值变化操作
  const onValuesChange = values => {
    if (Object.keys(values).includes('model')) {
      setState(draft => {
        draft.selectModel = values.model
      })
      const initValue = {}
      state.modelList.find(cur => cur.id === values.model)?.params.forEach(cur => {
        const type = cur.type.toLowerCase()
        if (['select'].includes(type)) {
          initValue[cur.name] = cur.defaultValue.split(';')[0]
        } else if (['json', 'jsonarray'].includes(type)) {
          initValue[cur.name] = JSON.stringify(cur.defaultValue, null, 2)
        } else {
          initValue[cur.name] = cur.defaultValue
        }
      })
      form.setFieldsValue({ params: initValue })
    }
  }

  return (
    <div className={styles.main}>
      <Form
        layout="vertical"
        form={form}
        onValuesChange={onValuesChange}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        labelAlign="left"
      >
        <Form.Item colon label={<>AI Model:</>} name="model" rules={[{ required: true, message: 'Please assign a value to the parameter.' }]}>
          <Select getPopupContainer={triggerNode => triggerNode.parentElement} options={state.modelList} fieldNames={{ label: 'name', value: 'id' }} />
        </Form.Item>
        {state.modelList.find(cur => cur.id === state.selectModel)?.params.map(cur => {
          const type = cur.type.toLowerCase()
          if (['select'].includes(type)) {
            return (
              <Form.Item name={['params', cur.name]} label={<>{`${cur.name}:`}</>} key={cur.name} rules={[{ required: true, message: 'Please assign a value to the parameter.' }]}>
                <Select getPopupContainer={triggerNode => triggerNode.parentElement} options={cur.defaultValue.split(';').map(item => ({ label: item, value: item }))} />
              </Form.Item>
            )
          } else if (['json', 'jsonarray'].includes(type)) {
            return (
              <Form.Item
                name={['params', cur.name]}
                label={<>{`${cur.name}:`}</>}
                key={cur.name}
                rules={[
                  { required: true, message: 'Please assign a value to the parameter.' },
                  {
                    validator: (_, value) => jsonValidator(value) ? Promise.resolve() : Promise.reject(),
                    message: 'Non JSON structure, please edit again'
                  }
                ]}
              >
                <Input.TextArea autoSize={{ minRows: 3, maxRows: 30 }} />
              </Form.Item>
            )
          } else if (['int', 'double'].includes(type)) {
            return (
              <Form.Item name={['params', cur.name]} label={<>{`${cur.name}:`}</>} key={cur.name} rules={[{ required: true, message: 'Please assign a value to the parameter.' }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            )
          } else if (['boolean'].includes(type)) {
            return (
              <Form.Item name={['params', cur.name]} label={<>{`${cur.name}:`}</>} key={cur.name} rules={[{ required: true, message: 'Please assign a value to the parameter.' }]}>
                <Select getPopupContainer={triggerNode => triggerNode.parentElement} options={[{ label: 'True', value: true }, { label: 'False', value: false }]} />
              </Form.Item>
            )
          } else if (['password'].includes(type)) {
            return (
              <Form.Item name={['params', cur.name]} label={cur.name} key={cur.name} rules={[{ required: true, message: 'Please assign a value to the parameter.' }]}>
                <Input.Password />
              </Form.Item>
            )
          } else {
            return (
              <Form.Item name={['params', cur.name]} label={<>{`${cur.name}:`}</>} key={cur.name} rules={[{ required: true, message: 'Please assign a value to the parameter.' }]}>
                <Input autocomplete='off' />
              </Form.Item>
            )
          }
        })}
      </Form>
    </div>
  )
}

export default forwardRef(DrawerForm)
