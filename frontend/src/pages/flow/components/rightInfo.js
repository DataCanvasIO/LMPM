import React, { forwardRef, useEffect, useRef } from 'react'
import { Form, Input, message, Table, Typography, Tooltip } from 'antd'
import { useImmer } from 'use-immer'
import Role from 'components/role'
import ConfigParams from './right-info/configParams'
import ScriptModal from './right-info/scriptModal'
import { parseTempVar, formMessage } from 'utils/variable'
import VectorDb from './right-info/vectordb'
import { IconFont } from 'components/icon'
import { InfoCircleOutlined } from '@ant-design/icons'
import ScriptIO from './right-info/scriptIO'
import ScriptParams from './right-info/scriptParams'
import { getVariablesList, editFlowInfo } from 'services/flow'
import { MAXVARIABLES } from 'config'
import styles from './index.less'

const { TextArea } = Input
let time = null

const RightInfo = forwardRef((props, ref) => {
  const roleRef = useRef()
  const [form] = Form.useForm()
	const { rightInfo, changeNodeParams, flowId, converseShowIo, changeFlowName, converseSaveIo, readonly, canvasRef} = props
  const [state, setState] = useImmer({
		type: 'flow',
		inputVariables: [],
		roleList: [],
		promptVariables: [],
		scriptModalVisible: false,
		flowInfo: null,
  })
	const { type } = state

	useEffect(() => {
		if (!rightInfo) return
		setState(draft => {
			draft.type = rightInfo?.module_type || 'flow'
		})
		if (state.flowInfo) {
			const data = {
				flowName: state.flowInfo.flowName,
				flowDescription: state.flowInfo.flowDescription,
			}
			form.setFieldsValue(data)
		} else {
			const data = {
				flowName: rightInfo.name,
				flowDescription: rightInfo.description,
			}
			setState(draft => {
				draft.flowInfo = data
			})
			form.setFieldsValue(data)
		}
		if (rightInfo?.module_type === 'input') {
			// setState(draft => {
			// 	draft.inputVariables = rightInfo?.params
			// })
			refreshInputVariable()
		} else if (['prompt', 'script_prompt'].includes(rightInfo?.module_type)) {
			// form.setFieldValue({rightInfo})
			setPromptData(rightInfo)
		} else if (['script', 'vectordb'].includes(rightInfo?.module_type)) {
			// form.setFieldValue({rightInfo})
			setScriptData(rightInfo)
		} else {
			setScriptData(rightInfo)
		}
	}, [JSON.stringify(rightInfo)])

	// set data
	const setPromptData = (values) => {
		const data = {
			alias: values.name,
			prompt: values?.params.prompt,
			roleName: values?.params?.role?.[0]?.value,
			rolePrompt: values?.params?.role?.[2]?.value
		}
		form.setFieldsValue(data)
		setState(d => {
			d.promptVariables = values?.params?.variables
		})
	}

	const refreshInputVariable = () => {
		getVariablesList({flow_id: flowId}).then(res => {
			if (res) {
				setState(draft => {
					draft.inputVariables = res
				})
				// changeNodeParams({
				// 	...rightInfo,
				// 	params: res,
				// })
			}
		})
	}

	React.useImperativeHandle(ref, () => ({
		refreshInputVariable
	}), [])

  // set data
  const setScriptData = (values) => {
    const data = {
      alias: values.name,
      description: values.description,
    }
    form.setFieldsValue(data)
  }

	// change input variables

	const setInputVariables = () => {
		// getData
		changeNodeParams({
			...rightInfo,
			params: [],
		})
	}

	const saveFlowInfo = (params) => {
		editFlowInfo(params).then(res => {
			console.log(res)
		})
	}

	const handleValueChange = (values) => {
		if (time) {
      clearTimeout(time)
			time = null
    }

		if ('flowName' in values) {
			if (values.flowName === '') return
			time = setTimeout(() => {
				changeFlowName(values.flowName)
        saveFlowInfo({
					id: flowId,
					name: values.flowName,
					// description: state.flowInfo.flowDescription
					description: form.getFieldValue('flowDescription')
				})
      }, 500)
		}

		if ('flowDescription' in values) {
			time = setTimeout(() => {
        saveFlowInfo({
					id: flowId,
					// name: state.flowInfo.flowName,
					name: form.getFieldValue('flowName'),
					description: values.flowDescription,
				})
      }, 500)
		}

    // change alias
    if ('alias' in values) {
      time = setTimeout(() => {
        changeNodeParams({
          ...rightInfo,
					name: values.alias,
        })
      }, 500)
      return
    }

		if ('description' in values) {
      time = setTimeout(() => {
        changeNodeParams({
          ...rightInfo,
					description: values.description,
        })
      }, 500)
      return
    }

		// change prompt
		if ('prompt' in values) {
			const newTems = parseTempVar(values.prompt)
			setState(d => {
				d.promptVariables = newTems
			})
      time = setTimeout(() => {
				if (newTems.length > MAXVARIABLES) {
					message.warning(`Add up to ${MAXVARIABLES} items！`)
					return
				}
				const { io: { outputs } } = rightInfo
				const newRightInfo  = {
          ...rightInfo,
					io: {
						inputs: converseShowIo(newTems),
						outputs,
					},
					params: {
						...rightInfo.params,
						variables: newTems,
						prompt: values.prompt,
					}
        }
        changeNodeParams(newRightInfo)
				canvasRef.current.changeNodeVersion(rightInfo, newRightInfo)
      }, 1000)
      return
    }

		// change
		if ('roleName' in values) {
			const currRole = roleRef?.current.findCurrRole(values.roleName)
			const role = rightInfo?.params?.role
			changeNodeParams({
				...rightInfo,
				params: {
					...rightInfo.params,
					role: [
						{...role?.[0], value: values.roleName},
						{...role?.[1], value: currRole ? currRole.name : role?.[1]?.value},
						{...role?.[2], value: currRole ? currRole.role_prompt : role?.[2]?.value}
					]
				}
			})
		}
	}

  const renderPrompt = (isScript = false) => {
		const columns = [
			{
				title: 'Variable',
				dataIndex: 'name',
				key: 'variable',
				width: 87,
				render: (r) => {
					return  <Typography.Text ellipsis={{rows: 1,  tooltip: r }} style={{ width: 85 }}>{r}</Typography.Text>
				}
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
				render: (r) => {
					return  <Typography.Text ellipsis={{rows: 1,  tooltip: r }} style={{ width: 80 }}>{r ? r : '--'}</Typography.Text>
				}
			},
		]

    return (
      <div className={styles.prompt}>
				<div class={styles.rightTitle}>
          <IconFont type="icon-prompt" style={{fontSize: 16, marginRight: 8 }}/>
					<Typography.Text ellipsis={{rows: 1,  tooltip: rightInfo?.module_name }} style={{ maxWidth: 230 }}>{rightInfo?.module_name}</Typography.Text>
        </div>
				<Form onValuesChange={handleValueChange} layout="vertical" form={form} disabled={readonly}>
					<div className={styles.rightItemTitle}>Name:</div>
          <Form.Item name="alias"  label="">
            <Input autocomplete='off' placeholder="Please input something." />
          </Form.Item>
					<div className={styles.rightItemTitle}>Prompt:</div>
          <Form.Item name="prompt" label="">
            <TextArea placeholder="please input prompt" rows={4}  />
          </Form.Item>
          <div className={styles.rightItemTitle}>
						Variables<Tooltip title="The same variable of multiple prompts is only assigned once.">
							<InfoCircleOutlined style={{fontSize: 14, marginLeft: 2 }}/>
						</Tooltip>:
          </div>
          <div>
            <Table columns={columns} dataSource={state.promptVariables} pagination={false} scroll={{y: 250}}/>
          </div>
          <div className={styles.rightItemTitle} style={{ marginTop: 12}}>
            Role:
          </div>
          <div>
            <Role formInstance={form} ref={roleRef} hasRolePrompt/>
          </div>
          {/* <div><ScriptIO formInstance={form}/></div> */}
          {/* <Button onClick={createInput}>create input</Button> */}
        </Form>
				{
					isScript && <>
						<div className={styles.rightItemTitle}>
							Script:
						</div>
						<div>
							<ScriptParams
								rightInfo={rightInfo}
								changeNodeParams={changeNodeParams}
							/>
						</div>
					</>
				}
        <ConfigParams  rightInfo={rightInfo} changeNodeParams={changeNodeParams} readonly={readonly}/>
		  </div>
    )
  }

	const handleScriptModalVisible = (v) => {
		setState(d => {
			d.scriptModalVisible = v
		})
	}

  const renderScript = () => {
		const ioProps = {
			formInstance: form,
			rightInfo: rightInfo,
			changeNodeParams: changeNodeParams,
			converseShowIo: converseShowIo,
			converseSaveIo: converseSaveIo,
			canvasRef: canvasRef
		}
		return (
      <div className={styles.script}>
				<div className={styles.rightTitle}>
          <IconFont type="icon-tool" style={{fontSize: 20, marginRight: 8}}/>
					<Typography.Text ellipsis={{rows: 1,  tooltip: rightInfo?.module_name }} style={{ maxWidth: 230 }}>{rightInfo?.module_name}</Typography.Text>
        </div>
				<Form onValuesChange={handleValueChange} layout="vertical" form={form} disabled={readonly}>
					<div className={styles.rightItemTitle}>Name:</div>
					<Form.Item name="alias" label="">
            <Input autocomplete='off' placeholder="Please input something." />
          </Form.Item>
					<div className={styles.rightItemTitle}>Description:</div>
          <Form.Item name="description" label="">
            <TextArea placeholder={`Please input something.`} />
          </Form.Item>
					<div className={styles.rightItemTitle}>
            Script:
          </div>
          <div className={styles.rightItemTitle} onClick={() => handleScriptModalVisible(true)} >
            {rightInfo.params?.script?.[0].editable === 'true' && <div className={`${styles.editSc} ${readonly ? styles.disabled : ''}`}>
						<IconFont className={styles.scriptEdit} type="icon-bianji" />edit</div>}
          </div>
					{state.scriptModalVisible && (
						<ScriptModal
							handleModalVisible={handleScriptModalVisible}
							visible={state.scriptModalVisible}
							rightInfo={rightInfo}
							changeNodeParams={changeNodeParams}
						/>
					)}
					<div>
						<ScriptParams
							rightInfo={rightInfo}
							changeNodeParams={changeNodeParams}
						/>
          </div>
					{
						rightInfo.params?.script?.[0].editable === 'true' && <>
							<div>
								<ScriptIO type="input" {...ioProps} />
							</div>
							<div style={{marginTop: '46px'}}>
								<ScriptIO type="output" {...ioProps} />
							</div>
						</>
					}
		    </Form>
      </div>
    )
  }

	const renderVectordb = () => {
		return (
      <div className={styles.script}>
				<div className={styles.rightTitle}>
          <IconFont type="icon-tool" style={{fontSize: 20, marginRight: 8}}/>
					<Typography.Text ellipsis={{rows: 1,  tooltip: rightInfo?.module_name }} style={{ maxWidth: 230 }}>{rightInfo?.module_name}</Typography.Text>
        </div>
				<Form onValuesChange={handleValueChange} layout="vertical" form={form} disabled={readonly}>
					<div className={styles.rightItemTitle}>Name:</div>
          <Form.Item name="alias" label="">
            <Input autocomplete='off' placeholder="Please input something." />
          </Form.Item>
					<div className={styles.rightItemTitle}>Description:</div>
          <Form.Item name="description" label="">
            <TextArea placeholder="please input description" />
          </Form.Item>
          <div className={styles.rightItemTitle}>
            Configuration:
          </div>
				</Form>
				<VectorDb rightInfo={rightInfo} changeNodeParams={changeNodeParams} readonly={readonly}/>
			</div>
    )
  }

  const renderInput = () => {
		const columns = [
			{
				title: 'Variable',
				dataIndex: 'variable',
				key: 'variable',
				width: 80,
				render: (r) => {
					return <Typography.Text ellipsis={{ rows: 1, tooltip: r }} style={{ width: 60 }}>{r}</Typography.Text>
				}
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
				render: (r) => {
					return  <Typography.Text ellipsis={{rows: 1,  tooltip: r }} style={{ width: 58 }}>{r ? r : '--'}</Typography.Text>
				}
			},
		]

    return (
      <div className={styles.input}>
        <div className={styles.rightTitle}>
          <IconFont type="icon-input" style={{fontSize: 18, marginRight:4, verticalAlign: 'middle'}} />
					<Typography.Text ellipsis={{rows: 1,  tooltip: rightInfo?.module_name }} style={{ maxWidth: 230 }}>{rightInfo?.module_name}</Typography.Text>
        </div>
        <div className={styles.rightItemTitle}>Description:</div>
        <div className={styles.inputDesc}>{rightInfo?.description}</div>
        <div className={styles.rightItemTitle}>Variables:
					<Tooltip title="The same variable of multiple prompts is only assigned once.">
						<InfoCircleOutlined style={{fontSize: 14, marginLeft: 8 }}/>
					</Tooltip>
				</div>
        <div>
          <Table columns={columns} dataSource={state.inputVariables} pagination={false} scroll={{x: 270}} />
        </div>
        {/* <Role formInstance={form}/> */}
      </div>
    )
  }

  const renderOutput = () => {
    return (
      <div>
        <div className={styles.rightTitle}>
          <IconFont type="icon-output" style={{ fontSize: 22, marginRight:4, verticalAlign: 'middle' }} />
					<Typography.Text ellipsis={{rows: 1,  tooltip: rightInfo?.module_name }} style={{ maxWidth: 230 }}>{rightInfo?.module_name}</Typography.Text>
        </div>
				<div className={styles.rightItemTitle}>Description:</div>
        <div className={styles.inputDesc}>{rightInfo?.description}</div>
      </div>
    )
  }

	const renderFlow = () => {
		return <div className={styles.script}>
		<div className={styles.rightTitle}>
			<IconFont type="icon-flow"  style={{marginRight: 8, fontSize: 20, verticalAlign: 'text-bottom'}}/>
			<Typography.Text style={{ maxWidth: 230 }}>Flow</Typography.Text>
		</div>
		<Form onValuesChange={handleValueChange} layout="vertical" form={form} disabled={readonly}>
			<div className={styles.rightItemTitle}>Name:</div>
			<Form.Item name="flowName" label="" rules={[{ required: true, message: formMessage.required }]}>
				<Input autocomplete='off' placeholder="Please input something." />
			</Form.Item>
			<div className={styles.rightItemTitle}>Description:</div>
			<Form.Item name="flowDescription" label="">
				<TextArea placeholder="please input description" />
			</Form.Item>
		</Form>
	</div>
	}

  let content = null

  switch (type) {
		case 'flow':
      content = renderFlow()
      break
    case 'prompt':
      content = renderPrompt()
      break
		case 'script_prompt':
			content = renderPrompt(true)
			break
    case 'script':
      content = renderScript()
      break
		case 'vectordb':
			content = renderVectordb()
      break
    case 'input':
      content = renderInput()
      break
    case 'output':
      content = renderOutput()
      break
    default:
			content = renderVectordb()
      break
  }

  return (
    <div className={styles.rightInfo}>
      {content}
    </div>
  )
})

export default RightInfo
