import React, { useEffect, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import { Form, Input, Button, Select, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { IconFont } from 'components/icon'
import RenderFromItem from './renderItem'
import styles from './index.less'

let time = null

const VectorDb = (props) => {
  const [form] = Form.useForm()
  const { rightInfo, changeNodeParams, readonly } = props

	const [state, setState] = useImmer({
		ctype: null,
	})

	const setFormValue = () => {
		const values = {}
		rightInfo.params.script.forEach(i => {
			const type = i.type?.toLowerCase()
			if (i.name === 'connection_type') {
				setState(draft => {
					draft.ctype = i.value ?? i.defaultValue.split(';')[0]
				})
			}
			if (type === 'file') {
				if (!i.value) {
					values[i.name] = []
				} else {
					values[i.name] = [{
						name: i.value?.split('/').slice(-1),
						status: 'success',
						response: {
							code: 0,
							data: i.value
						},
					}]
				}
			} else if (type === 'select') {
				values[i.name] =  i.value ?? i.defaultValue.split(';')[0]
				// ['json', 'jsonarray'].includes(item.type) ?  :
			} else {
				values[i.name] = i.value ?? i.defaultValue
			}
			// values[i.name] = i.value ?? i.defaultValue
		})
		
		form.setFieldsValue(values)
	}

	const handleValueChange = (values) => {
		const keys = Object.keys(values)
		if (keys[0] === 'connection_type') {
			setState(draft => {
				draft.ctype = values[keys[0]]
			})
		}
		if (time) {
      clearTimeout(time)
			time = null
    }

		time = setTimeout(() => {
			const index = rightInfo.params.script.findIndex(f => {
				return f.name === keys[0]
			})
			const newDb = JSON.parse(JSON.stringify(rightInfo.params.script))
			if (newDb[index].type === 'file') {
				newDb[index].value = values[keys[0]] ? values[keys[0]]?.[0]?.response?.data : []
			} else {
				newDb[index].value = values[keys[0]]
			}
			changeNodeParams({
				...rightInfo,
				params: {
					...rightInfo.params,
					script: newDb
				}
			})
		}, 500)
	}

	const handleConnectionType = (f) => {
		if (state.ctype === 'local') {
			if (f.name === 'host' || f.name === 'port') {
				return false
			}
		} 
		return true
	}

  useEffect(() => {
		if (rightInfo?.params?.script) {
			setFormValue()
		}
  }, [JSON.stringify(rightInfo)])

	// const uploadProps = {
	//   accept: '.json,.xml,.md,.xls,.xlsx,.tsv,.csv,.txt,.doc,.docx',
  //   action: '/api/chat/model/upload/file',
	// 	maxCount: 1,
	// 	progress: {
  //     strokeColor: {
  //       '0%': '#7340C8',
  //       '100%': '#7340C8',
  //     },
	// 		showInfo: false,
  //     strokeWidth: 2,
  //   },
  //   showUploadList: {
  //     showRemoveIcon: true,
  //     removeIcon: <IconFont type="icon-shanchu" />,
  //   },
  //   iconRender: () => <IconFont type="icon-lianjie1" />,
	// 	onChange(info) {
	// 		if (info.file.status !== 'uploading') {
	// 			console.log(info.file, info.fileList);
	// 		}
	// 		if (info.file.status === 'done') {
	// 			message.success(`${info.file.name} file uploaded successfully`);
	// 		} else if (info.file.status === 'error') {
	// 			message.error(`${info.file.name} file upload failed.`);
	// 		}
	// 	},
	// 	onRemove(info) {
	// 		console.log('removeinfo', info)
	// 	}
	// };

	// const renderItem = (item) => {
	// 	const type = item.type?.toLowerCase()
	// 	if (['select'].includes(type)) {
	// 		return <Select options={item.defaultValue.split(';').filter(f => f).map(item => ({ label: item, value: item }))} />
	// 	} else if (['file'].includes(type)) {
	//     return <Upload {...uploadProps} key={item.name}>
	// 			<Button icon={<UploadOutlined />}>Upload</Button>
	// 		</Upload>
	// 	} else {
	// 		return <Input autocomplete='off' placeholder={`please input ${item.name}`}/>
	// 	}
	// }

	const getValue = (obj) => {
		return obj.fileList
	}
	
  return (
    <div className={styles.configParams}>
		 	<Form
				onValuesChange={handleValueChange}
				layout="vertical"
				form={form}
				disabled={readonly}
			>
				{rightInfo?.params?.script?.filter(f => f.name !== 'script' && handleConnectionType(f)).map(item => 
					(<>
					<div className={styles.formItemTitle}>{item.name}:</div>
          <Form.Item
						name={item.name}
						key={item.name}
						defaultValue={item.defaultValue}
						// rules={[{ required: true, message: `${item.name} is required` }]}
						label=''
						valuePropName={item.type === 'file' ? "fileList" : "value"}
						getValueFromEvent={item.type === 'file' ? getValue : null}
					>
						{/* {renderItem(item)} */}
						{/* <RenderFromItem item={item} key={item} /> */}
						{RenderFromItem(item)}
					</Form.Item>
        </>)
				)}
			</Form>
    </div>
  )
}

export default VectorDb
