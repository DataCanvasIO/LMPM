import React, { useEffect, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import { Form, Input, Button, Select, Typography } from 'antd'
import { getModelList } from 'services/aiModel'
import { jsonValidator } from 'utils/variable'
import RenderFromItem from './renderItem'
import styles from './index.less'

let time = null
const booleanOptions = [
  {
    value: true,
    label: 'True'
  },
  {
    value: false,
    label: 'False'
  },
]
const ConfigParams = (props) => {
  const [form] = Form.useForm()
  const modelVersionListRef = useRef(modelVersionList)
  const { rightInfo, changeNodeParams, readonly } = props
	const hasErrorRef = useRef(false)
  const [state, setState] = useImmer({
		modelList: [],
		formArr: [],
		modelId: '',
		modelVersionList: [],
		modelVersionData: '',
  })
	const isFirstRenderRef = useRef(true)
	const { formArr, modelVersionList, modelVersionData } = state
	const filterKeys = ['modelId', 'result', 'message', 'model_param_define', 'model_config', 'stream', 'errorMessage', 'stream_result']

  useEffect(() => {
		queryModelList()
  }, [])

	useEffect(() => {
		if (rightInfo?.params?.model) {
			getConfigData()
			setFormValue()
		}
  }, [JSON.stringify(rightInfo)])

	const setFormValue = () => {
		const values = {}
		rightInfo.params.model.forEach(i => {
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

	const getConfigData = () => {
		const formArr = rightInfo.params.model.filter(f => {
			if (f.name === 'modelId') {
				setState(d => {
					d.modelId = f.value
				})
			}
			// if (f.name === 'model') {
			// 	setState(d => {
			// 		d.modelVersionData = f
			// 	})
			// 	if (f.type === 'select') {
			// 		setState(d => {
			// 			d.modelVersionList = f.defaultValue?.split(',')
			// 		})
			// 		modelVersionListRef.current = f.defaultValue?.split(',')
			// 	}
			// }
			// && f.name !== 'model'
			return !filterKeys.includes(f.name)
		})

		setState(d => {
			d.formArr = formArr
		})
	}

  const queryModelList = () => {
		getModelList().then(res => {
			if (res) {
				setState(d => {
					d.modelList = res.rows
				})
			}
		})
	}

	const handleValueChange = (values) => {
		setTimeout(() => {
			if (hasErrorRef.current) return
			const keys = Object.keys(values)
			if (keys[0] === 'modelId') return
			if (time) {
				clearTimeout(time)
				time = null
			}

			time = setTimeout(() => {
				const index = rightInfo.params.model.findIndex(f => {
					return f.name === keys[0]
				})
				const newModel = JSON.parse(JSON.stringify(rightInfo.params.model))
				const type = newModel[index].type?.toLowerCase()
				if (['json', 'jsonarray'].includes(type)) {
					newModel[index].value = JSON.parse(values[keys[0]])
				} else {
					newModel[index].value = values[keys[0]]
				}
				changeNodeParams({
					...rightInfo,
					params: {
						...rightInfo.params,
						model: newModel
					}
				})
			}, 500)
		}, 20)
	}

	const handleModelChange = (v) => {
		const currModel = state.modelList.find(f => f.id === v)
		if (currModel) {
			const formArr = currModel.params.filter(f => {
				return !filterKeys.includes(f.name)
			})
			setState(d => {
				d.formArr = formArr
			})
			// save new model
			const model = rightInfo.params.model.find(f => f.name === 'modelId')
			const copyModel = {...model}
			copyModel.value = v
			const newModel = [copyModel, ...currModel.params]
			changeNodeParams({
				...rightInfo,
				params: {
					...rightInfo.params,
					model: newModel
				}
			})
		}
	}

	// const renderItem = (item) => {
	// 	const type = item.type?.toLowerCase()
	// 	if (['select'].includes(type)) {
	// 		return <Select options={item.defaultValue.split(';').filter(f => f).map(item => ({ label: item, value: item }))} />
	// 	} else if(['json', 'jsonarray'].includes(type)) {
	// 		return <Input.TextArea autoSize={{ minRows: 3, maxRows: 30 }} />
	// 	} else if (['int', 'double'].includes(type)) {
	// 		return <Input autocomplete='off' />
	// 	} else if (['password'].includes(type)) {
	// 		return <Input.Password />
	// 	} else if (['boolean'].includes(type)) {
	// 		return <Select options={booleanOptions} />
	// 	}else {
	// 		return <Input autocomplete='off' />
	// 	}
	// }

  useEffect(() => {
		queryModelList()
  }, [])

	useEffect(() => {
		if (rightInfo?.params?.model) {
			getConfigData()
			setFormValue()
		}
  }, [JSON.stringify(rightInfo)])
  
  return (
    <div className={styles.configParams}>
		 	<Form
				onValuesChange={handleValueChange}
				layout="vertical"
				form={form}
				disabled={readonly}
			>
        <div className={styles.rightItemTitle}>Configuration:</div>
				<div className={styles.formItemTitle}>Model:</div>
				<Form.Item
					name="modelId"
					key="modelId"
					// rules={[{ required: true, message: `name is required` }]}
					label=""
				>
					<Select
            getPopupContainer={triggerNode => triggerNode.parentElement}
						onChange={handleModelChange}
						options={state.modelList.map(item => ({ label: item.name, value: item.id }))}
					/>
				</Form.Item>
       	{/* <div className={styles.rightItemTitle}>Parameters:</div> */}
				{
					formArr.map(item => {
						return (<>
							<div className={styles.formItemTitle}>{item.name}:</div>
              <Form.Item
                name={item.name}
                key={item.name}
                // defaultValue={item.defaultValue}
                // rules={[{ required: true, message: `${item.name} is required` }]}
                label=''
								rules={['json', 'jsonarray'].includes(item.type?.toLowerCase()) ? [
                  {
                    validator: (_, value) => {
											if (jsonValidator(value)) {
												hasErrorRef.current = false
												return Promise.resolve()
											} else {
												hasErrorRef.current = true
												return Promise.reject()
											}
										},
                    message: 'Non JSON structure, please edit again'
                  }
                ] : null}
              >
                {/* {renderItem(item)} */}
								{/* <RenderFromItem item={item} key={item} /> */}
								{RenderFromItem(item)}
              </Form.Item>
						</>)
					})
				}
			</Form>
    </div>
  )
}

export default ConfigParams
