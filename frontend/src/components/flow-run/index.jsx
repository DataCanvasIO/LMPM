import React, { useEffect, forwardRef, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import { Modal, Form, Input, Button, Upload, message, Tabs, Tooltip, Typography } from 'antd'
import { UploadOutlined, CheckCircleTwoTone, CloseCircleOutlined, LoadingOutlined} from '@ant-design/icons'
import { getVariablesList, runFlow, getFlowStatus, checkInput } from 'services/flow'
import { formMessage } from 'utils/variable'
import { formatTimeStamp } from '../../utils'
import { IconFont } from 'components/icon'
import useInterval from '../../hooks/useInterval'
import styles from './index.less'

const { TextArea } = Input
const formLayout = {
  labelCol:{ span: 8 },
  wrapperCol: { span: 12 }
}

const RunModal = (props, ref) => {
  const [form] = Form.useForm()
  const { flowId, showStatus, handleShowStatus, isList = false, listStatus, name } = props
  const [state, setState] = useImmer({
    step: showStatus ? 2 : 1,
		time: null,
		variables: [
			// {
			// 	type: 'file',
			// 	variable: 'Comment (判断评论属性)',
			// 	defaultValue: '/sdsdsadas/dasdasdad/dsaas'
			// },
		],
		runList: [
			// {
			// 	type: 'file',
			// 	node_name: 'Comment (判断评论属性)',
			// 	status: 'RUNNING',
			// 	runTime: 'xxxx',
			// },
		],
		runStatus: 'RUNNING',
		result: [],
		resultValue: '',
		runAllTime: '',
		runVisible: false,
		alreadyRun: false,
		support: true
  })

	useEffect(() => {
		!isList && initShowStatus()
	}, [])

	useEffect(() => {
		if (state.runVisible && !showStatus) {
			getVariables()
		}
	}, [state.runVisible])

	useEffect(() => {
		if (state.runVisible && showStatus && isList) {
			getStatus()
			setState(draft => {
				draft.time = 3000
			})
		}
	}, [state.runVisible])


	useInterval(() => {
    getStatus();
  }, state.time);

	useEffect(() => {
		listStatus && setState(draft => {
			draft.runStatus = listStatus
			draft.alreadyRun = true
		})
	}, [listStatus])

	useEffect(() => {
    if (state.variables.length > 0) {
      const fieldValues = {}
			state.variables.forEach(cur => {
        if (cur.type === 'file') {
					if (!cur.defaultValue) {
						fieldValues[`${cur.variable}${cur.type}`] = []
					} else {
						fieldValues[`${cur.variable}${cur.type}`] = [{
							name: cur.defaultValue?.split('/').slice(-1),
							status: 'success',
							response: {
								code: 0,
								data: cur.defaultValue
							},
						}]
					}
        } else {
          fieldValues[`${cur.variable}${cur.type}`] = cur.defaultValue
        }
      })
      form.setFieldsValue(fieldValues)
    }
  }, [state.variables])


	React.useImperativeHandle(ref, () => {
		return {
			changeShowStatus
		}
	}, [])

	const initShowStatus = () => {
		// if (showStatus) {
			getStatus();
			setState(draft => {
				draft.time = 3000
			})
		// }
	}

	const changeShowStatus = () => {
		if (showStatus) {
			getStatus()
			setState(draft => {
				draft.time = 3000
				draft.alreadyRun = true
				draft.runStatus = 'RUNNING'
			})
		} else {
			getStatus()
			setState(draft => {
				draft.runStatus = 'RUNNING'
			})
		}
	}

	const getVariables = async () => {
		const res = await getVariablesList({flow_id: flowId})
		if (res) {
			setState(draft => {
				draft.variables = res
			})
		}
		return res
	}

	const run = (data) => {
		runFlow({id: flowId, variables: data}).then(res => {
			console.log(res)
			if (res) {
				getStatus()
				setState(draft => {
					draft.time = 3000
				})
				handleShowStatus && handleShowStatus()
			}
		})
	}

	function msToTime(ms) {
		const seconds = Math.floor((ms / 1000) % 60)
		const minutes = Math.floor((ms / (1000 * 60)) % 60)
		const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
		return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds)
	}

	const getStatus = () => {
		getFlowStatus({id: flowId}).then(res => {
			if (res) {
				setState(draft => {
					draft.alreadyRun = true
					draft.runList = res.nodes_info
					draft.runStatus = res.status
				})
				if (res.status !== 'RUNNING') {
					setState(draft => {
						draft.time = null
					})
				}
				if (res.status === 'SUCCESS') {
					setState(draft => {
						draft.result = res.outputs
						// draft.runStatus = 'SUCCESS'
						draft.resultValue = res.outputs[0]?.value
						draft.support = res.outputs[0]?.supportView
						draft.runAllTime = msToTime((res.end_time * 1000).toFixed(0) - (res.start_time * 1000).toFixed(0))
					})
				}
				if (res.status === 'FAILED') {
					setState(draft => {
						// draft.runStatus = 'FAILED'
						draft.runAllTime = msToTime((res.end_time * 1000).toFixed(0) - (res.start_time * 1000).toFixed(0))
					})
				}
			} else {
				setState(draft => {
					draft.alreadyRun = false
					draft.time = null
				})
			}
		})
	}

  const handleOk = () => {

  }

	const cancel = () => {
		handleRunModalVisible(false)
	}

	const handleRun = () => {
		form.validateFields().then(res => {
			if (res) {
				const params = state.variables.map(item => {
					return  {
						...item,
						value: item.type === 'file' ? res[`${item.variable}${item.type}`]?.[0]?.response?.data : res[`${item.variable}${item.type}`]
					}
				})
				run(params)
				setState(draft => {
					draft.step = 2
					draft.runStatus = 'RUNNING'
				})
			}
		})
	}

	const viewRsult = () => {
		setState(draft => {
			draft.step = 3
		})
	}

	const uploadProps = {
	  accept: '.json,.xml,.md,.xls,.xlsx,.tsv,.csv,.txt,.doc,.docx',
    action: '/api/chat/model/upload/file',
		maxCount: 1,
		progress: {
      strokeColor: {
        '0%': '#7340C8',
        '100%': '#7340C8',
      },
			showInfo: false,
      strokeWidth: 2,
    },
    showUploadList: {
      showRemoveIcon: true,
      removeIcon: <IconFont type="icon-shanchu" />,
    },
    iconRender: () => <IconFont type="icon-lianjie1" />,
		onChange(info) {
			if (info.file.status !== 'uploading') {
				console.log(info.file, info.fileList);
			}
			if (info.file.status === 'done') {
				message.success(`${info.file.name} file uploaded successfully`);
			} else if (info.file.status === 'error') {
				message.error(`${info.file.name} file upload failed.`);
			}
		},
		onRemove(info) {
			console.log('removeinfo', info)
		}
	};

	const renderItem = (item) => {
		if (item.type === 'text') {
			return 	<TextArea placeholder="Assign variable" autoSize={{ minRows: 1, maxRows: 5 }}/>
		}
		if (item.type === 'file') {
			return   <Upload {...uploadProps} key={item.name}>
				<Button icon={<UploadOutlined />}>Upload</Button>
			</Upload>
		}
		return <TextArea placeholder="Assign variable" autoSize={{ minRows: 1, maxRows: 5 }}/>
	}

	const getBtn = (c) => {
		if (state.runStatus === 'SUCCESS') {
			return [c, <Button type="primary" onClick={viewRsult}>View Result</Button>]
		}
		if (state.runStatus === 'FAILED') {
			return [c]
		}
		return [c]
	}

	const renderFooter = () => {
		const c = <Button onClick={cancel}>Cancel</Button>
		if (state.step === 1) {
			return [c, <Button type="primary" onClick={handleRun}>Run</Button>]
		}
		if (state.step === 2) {
			return getBtn(c)
		}
		if (state.step === 3) {
			return [c]
		}
	}

	const handleValueChange = (value) => {
		console.log(value);
	}

	const handleTabChange = (i) => {
		setState(draft => {
			draft.resultValue = state.result[i].value
			draft.support = state.result[i].supportView
		})
	}

	const getValue = (obj) => {
		return obj.fileList
	}

	const handleRunModalVisible = async (v, step) => {
		if (!showStatus) {
			const res = await checkInput({id: flowId})
			if (!res) return
		}
		if (step === 1) {
			setState(draft => {
				draft.runList = []
			})
			getVariables().then(res => {
				if (res && Array.isArray(res) && res.length > 0) {
					setState(draft => {
						draft.runVisible = v
						draft.step = step
					})
				} else {
					run([])
					setState(draft => {
						draft.step = 2
						draft.runVisible = v
					})
				}
			})
		} else {
			setState(draft => {
				draft.runVisible = v
				draft.step = step
			})
		}
  }

	const statusIcon = {
		RUNNING: <IconFont type="icon-loading" className={styles.icon} spin style={{ color: '#1976D2'}}/>,
		FAILED: <CloseCircleOutlined style={{color: '#ff0000'}} className={styles.icon} />,
		SUCCESS: 	<CheckCircleTwoTone twoToneColor="#52c41a" className={styles.icon} />,
	}

	function upperFirstWord(str) {  
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());  
	}  

	const getInitValue = (item) => {
		if (item.type === 'file' && item.defaultValue) {
			return [{
				name: item.defaultValue.split('/').slice(-1),
				status: 'success',
				response: {
					code: 0,
					data: item.defaultValue
				},
			}]
		}
		return item.defaultValue
	}

  return (<>
		{
			(showStatus && state.alreadyRun) && <div className={styles.showStatus}>
				{statusIcon[state.runStatus]}
				<span className={styles.statusText}>{upperFirstWord(state.runStatus)}</span>
				<span className={styles.btn} 	onClick={() => handleRunModalVisible(true, 2)}>View</span>
			</div>
		}
		{
			!showStatus && !isList && <Button
				type="primary"
				disabled={state.runStatus === 'RUNNING' && state.alreadyRun}
				style={{borderRadius:'8px', height:'38px' }}
				onClick={() => handleRunModalVisible(true, 1)}
			>
				RUN
			</Button>
		}
		{
			!showStatus && isList && <Tooltip title='Try'>
				<IconFont
					type="icon-run"
					className={state.runStatus === 'RUNNING' && state.alreadyRun ? styles.disabled : ''}
					onClick={state.runStatus === 'RUNNING' && state.alreadyRun ? null : () => handleRunModalVisible(true, 1)}
				/>
			</Tooltip>
		}
    {state.runVisible && <Modal
      title={ isList ? 'Try' : 'Run'}
      onOk={handleOk}
      open={state.runVisible}
      onCancel={() => handleRunModalVisible(false)}
      maskClosable={false}
      destroyOnClose
      width={960}
      cancelText="Cancel"
      okText="OK"
			footer={renderFooter()}
    >
      <div className={styles.runModal}>
				{
					state.step === 1 && <>
						<div className={styles.title}>Assign variables of the flow:</div>
						<Form
							onValuesChange={handleValueChange}
							// layout="vertical"
							form={form}
							{...formLayout}
						>
						{
							Array.isArray(state.variables) && state.variables.map(item => {
								return (
									<Form.Item
										name={`${item.variable}${item.type}`}
										key={`${item.variable}${item.type}`}
										// initialValue={getInitValue(item)}
										rules={[{ required: true, message: formMessage.required }]}
										label={<Typography.Text style={{ whiteSpace: 'pre' }} ellipsis={{ rows: 1,  tooltip: item.variable }} >{item.variable}</Typography.Text>}
										valuePropName={item.type === 'file' ? "fileList" : "value"}
										getValueFromEvent={item.type === 'file' ? getValue : null}
									>
										{renderItem(item)}
									</Form.Item>
								)
							})
						}
						</Form>
					</>
				}
				{
					state.step === 2 && <>
						<div className={styles.runWrapper}>
							 <div className={styles.runResult}>
									{
										state.runStatus === 'RUNNING' && <><span style={{marginLeft: 20}}>{statusIcon['RUNNING']}</span>
										<Typography.Text ellipsis={{rows: 1,  tooltip: name }} className={styles.priColor}>
											{name}
										</Typography.Text>
										<span className={styles.priColor} style={{marginLeft: 8}}>running</span></>
									}
									{
										state.runStatus === 'SUCCESS' && <div>
											{/* <CheckCircleTwoTone twoToneColor="#52c41a" className={styles.icon} /> */}
											{statusIcon['SUCCESS']}
											<Typography.Text ellipsis={{rows: 1,  tooltip: name }} style={{maxWidth: 138}} className={styles.priColor}>
												{name}
											</Typography.Text>
											{' '}
											<span className={styles.priColor}>run successfully</span>
										</div>
									}
									{
										state.runStatus === 'FAILED' && <div>
											{/* <CloseCircleOutlined style={{color: '#ff0000'}} className={styles.icon} /> */}
											{statusIcon['FAILED']}
											<Typography.Text ellipsis={{rows: 1,  tooltip: name }} className={styles.priColor}>
												{name}
											</Typography.Text>
											{' '}
											<span className={styles.priColor}>run failed</span>
										</div>
									}
									{
										state.runStatus !== 'RUNNING' && <><div>
											<span className={styles.text}>Successful steps:</span>
											<span className={styles.priColor}>{state.runList.filter(f => f.status === 'SUCCESS').length}</span>
										</div>
										<div>
											<span className={styles.text}>Elapsed time:</span>
											<span className={styles.priColor}>{state.runAllTime}</span>
										</div></>
									}

							 </div>
							 <div className={styles.runList}>
								 {
									 state.runList.filter(f => f.status !== 'QUEUED').map(item => {
										 return (<div className={styles.runItem}>
												<div className={styles.runName}>
													<Typography.Paragraph ellipsis={{rows: 1,  tooltip: item.node_name }}>
														{item.node_name}
													</Typography.Paragraph>
												</div>
												<div className={styles.status}>
													{
														item.status === 'SUCCESS' && <>
															{/* <CheckCircleTwoTone twoToneColor="#52c41a" className={styles.icon} /> */}
															{statusIcon['SUCCESS']}
															<span className={styles.priColor}>Run successfully</span>
														</>
													}
													{
														item.status === 'FAILED' && <>
															{/* <CloseCircleOutlined style={{color: '#ff0000'}} className={styles.icon} /> */}
															{statusIcon['FAILED']}
															<span className={styles.priColor}>Run failed</span>
															<div className={styles.reason}>
																	{/* Chroma Reader run failed because of
																	Chroma Reader run failed because of
																	Chroma Reader run failed because of */}
																	<TextArea autoSize={{ minRows: 2, maxRows: 8 }} className={styles.errorMsg} value={item.error_msg}/>
															</div>
														</>
													}
													{
														item.status === 'RUNNING' && <>
															{/* <LoadingOutlined className={styles.icon} /> */}
															{statusIcon['RUNNING']}
															<span className={styles.priColor}>Running</span>
														</>
													}
												</div>
												<div className={styles.time}>
													{item.end_time ? formatTimeStamp(item.end_time, true) : '--'}
												</div>
											</div>
										 )
									 })
								 }
							 </div>
						</div>
					</>
				}
				{
					state.step === 3 && <>
						<div className={styles.runResult}>
							<Tabs
								defaultActiveKey="1"
								onChange={handleTabChange}
								items={
									state.result.map((item, index) => {
										return {
											label: upperFirstWord(item.name),
											key: index,
										}
									})
								}
							/>
							{
								state.support ? <TextArea autoSize={{ minRows: 10, maxRows: 20 }} value={state.resultValue}/> : 
								<div className={styles.noSupport}>Preview is not supported for the result.</div> 
							}
						</div>
					</>
				}
      </div>
    </Modal>}
		</>
  )
}



export default forwardRef(RunModal)
