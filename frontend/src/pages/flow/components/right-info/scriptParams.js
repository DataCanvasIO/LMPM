import React, { useEffect, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import { Form, Input, Button, Select, Typography } from 'antd'
import RenderFromItem from './renderItem'
import styles from './index.less'

let time = null

const ScriptParams = (props) => {
  const [form] = Form.useForm()
  const { rightInfo, changeNodeParams, readonly } = props
	const setFormValue = () => {
		const values = {}
		rightInfo.params.script.forEach(i => {
			const type = i.type?.toLowerCase()
			if (type === 'select') {
				values[i.name] =  i.value ?? i.defaultValue.split(';')[0]
				// ['json', 'jsonarray'].includes(item.type) ?  :
			} else if (['json', 'jsonarray'].includes(type)) {
				values[i.name] = JSON.stringify(i.value ?? i.defaultValue, null, 2)
			} else {
				values[i.name] = i.value ?? i.defaultValue
			}
		})
		form.setFieldsValue(values)
	}

	const handleValueChange = (values) => {
		const keys = Object.keys(values)
		if (time) {
      clearTimeout(time)
			time = null
    }
  
		time = setTimeout(() => {
			const index = rightInfo.params.script.findIndex(f => {
				return f.name === keys[0]
			})
			const newSc = JSON.parse(JSON.stringify(rightInfo.params.script))
			newSc[index].value = values[keys[0]]
			changeNodeParams({
				...rightInfo,
				params: {
					...rightInfo.params,
					script: newSc
				}
			})
		}, 500)
	}

  useEffect(() => {
		if (rightInfo?.params?.script) {
			setFormValue()
		}
  }, [JSON.stringify(rightInfo)])

  return (
    <div className={styles.configParams}>
		 	<Form
				onValuesChange={handleValueChange}
				layout="vertical"
				form={form}
			>
				{rightInfo?.params?.script?.slice(1).map(item => (
          <Form.Item
						name={item.name}
						key={item.name}
						defaultValue={item.defaultValue}
						// rules={[{ required: true, message: `${item.name} is required` }]}
						label={item.name}
					>
						{/* <Input autocomplete='off'	placeholder={`please input ${item.name}`}/> */}
						{/* <RenderFromItem item={item} key={item} /> */}
						{RenderFromItem(item)}
					</Form.Item>
        ))}
			</Form>
    </div>
  )
}

export default ScriptParams
