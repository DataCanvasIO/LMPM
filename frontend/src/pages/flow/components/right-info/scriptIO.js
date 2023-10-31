import React, { useEffect, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import { SettingOutlined,  FormOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { Modal, Form, Table, Input, Typography, message, Button} from 'antd'
import { UUID } from 'utils'
import { MAXVARIABLES } from 'config'
import styles from './index.less'

const { TextArea } = Input

const ScriptIO = (props) => {
  const [form] = Form.useForm()
  const newIdRef = useRef()
	const currEditIndexRef = useRef()
  const tableRef = useRef()
  const { type= 'input', rightInfo, changeNodeParams, converseShowIo, converseSaveIo, canvasRef } = props
  const [state, setState] = useImmer({
		ioData: [],
		tableData: [],
		visible: false,
		editingKey: '',
    isNew: false,
  })
	const { ioData, tableData, editingKey, visible } = state

  const handleModalVisible = (v) => {
		setState(d => {
			d.visible = v
		})
	}

	const handleOpenModal = () => {
		handleModalVisible(true)
		setState(d => {
			d.tableData = ioData
		})
	}

	const handleOk = () => {
		if (state.editingKey !== '') {
      message.error('You have not saved the prompt, please confirm after saving!')
			return
    }
		handleModalVisible(false)
		setState(d => {
			d.editingKey = ''
			d.ioData = tableData
		})
		const newData = converseShowIo(tableData)
		const io = type === 'input' ? {
			inputs: newData,
			outputs: rightInfo.io.outputs
		} : {
			inputs: rightInfo.io.inputs,
			outputs: newData
		}
		const newRightInfo = {
			...rightInfo,
			io,
		}
		changeNodeParams(newRightInfo)
		canvasRef.current.changeNodeVersion(rightInfo, newRightInfo)
	}

	const isEditing = (record) => record.name === editingKey || record.id === editingKey

  const edit = (record, index, isNew) => {
		currEditIndexRef.current = index
    form.setFieldsValue({
      ...record,
    })
		setState(d => {
      d.editingKey = record.name || record.id
      d.isNew = isNew
    })
	}

  const cancel = (record) => {
    if (state.isNew) {
		  deleteItem(record)
    } else {
      setState(d => {
        d.editingKey = ''
      })
    }
  }

	const save = async (key) => {
    try {
      const row = await form.validateFields()
      const newData = [...tableData]
      const index = newData.findIndex((item) => key === (item.name || item.id))
      if (index > -1) {
        const item = newData[index]
        newData.splice(index, 1, {
          ...item,
          ...row,
        })
				setState(d => {
					d.tableData = newData
					d.editingKey = ''
				})
      } else {
        newData.push(row)
				setState(d => {
					d.tableData = newData
					d.editingKey = ''
				})
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }

	const deleteItem = (record) => {
		const index = state.tableData.findIndex(x => {
			return x.name === record.name
    })
    setState(draft => {
      const newData = [...draft.tableData]
			newData.splice(index, 1)
      draft.editingKey = ''
      draft.tableData = newData
    })
	}

	const columns = [
		{
      title: type === 'input' ? 'Input' : 'Output',
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: '20%',
      editable: true,
    },
		{
      title: 'Description',
      dataIndex: 'description',
      width: '30%',
      editable: true,
    },
    {
      title: 'Action',
      dataIndex: 'Action',
      render: (_, record, index) => {
        const editable = isEditing(record)
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.name || record.id)} style={{ marginRight: 8 }}>
              <CheckCircleOutlined />
            </Typography.Link>
						<Typography.Link onClick={() => cancel(record)}>
							<CloseCircleOutlined />
						</Typography.Link>
          </span>
        ) : (
					<span>
            <Typography.Link
              disabled={editingKey !== ''}
              onClick={() => edit(record, index, false)}
              style={{ marginRight: 8 }}>
              <FormOutlined />
            </Typography.Link>
            <Typography.Link onClick={() => deleteItem(record)}>
              <DeleteOutlined />
            </Typography.Link>
          </span>
        )
      },
    },
	]

	const EditableCell = ({
		editing,
		dataIndex,
		title,
		inputType,
		record,
		index,
		children,
		...restProps
	}) => {
		const inputNode = inputType === 'textarea'
      ? <TextArea placeholder="Please input something." rows={1} />
      : <Input autocomplete='off' placeholder="Please input something."/>

		return (
			<td {...restProps}>
				{editing ? (
					<Form.Item
						name={dataIndex}
						style={{ margin: 0 }}
						rules={[
							{ required: true, message: `Please input something.` },
							{
								validator: (_, value) => {
									if (_.dataIndex !== 'name') {
										Promise.resolve()
									}
									let fIndex = state.tableData.findIndex((cur, curIndex) => cur.name === value && curIndex !== currEditIndexRef.current)
									return fIndex === -1 ? Promise.resolve() : Promise.reject()
								},
                message: `The ${type} name is duplicate`
							}
						]}
					>
						{inputNode}
					</Form.Item>
				) : (
					children
				)}
			</td>
		)
	}

	const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'description' ? 'textarea' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    }
  })

  useEffect(() => {
		if (rightInfo) {
			if (type === 'input') {
				setState(d => {
					d.ioData = converseSaveIo(rightInfo.io?.inputs)
				})
			} else {
				setState(d => {
					d.ioData = converseSaveIo(rightInfo.io?.outputs)
				})
			}
		}
  }, [rightInfo])

  return (
    <div className={styles.scriptIO}>
      <div className={styles.scriptIOTitle}>
        <div className={styles.scriptIOText}>{type === 'input' ? 'Input' : 'Output'}:</div>
        <div className={styles.setting}><SettingOutlined onClick={() => handleOpenModal()} /></div>
      </div>
      <div className={styles.ioList}>
        {
          ioData.map(item => <div className={styles.ioItem}>
            <div className={styles.name}>{item.name ? item.name : '--'}</div>
            <div className={styles.type}>{item.type ? item.type : '--'}</div>
          </div>)
        }
      </div>
      {state.visible && (
        <Modal
          title={type}
          onOk={handleOk}
          open={state.visible}
          onCancel={() => handleModalVisible(false)}
          maskClosable={false}
          destroyOnClose
          bodyStyle={{minHeight: '40vh'}}
          width={960}
          cancelText="Cancel"
          okText="OK"
        >
          <div className={styles.ioNew}>
            <Button
              type="primary"
              onClick={() => {
                if (state.editingKey !== '') {
                  message.warning('Please save the edited items before adding them!')
                } else {
                  if (tableData.length === MAXVARIABLES) {
                    message.warning(`Add up to ${MAXVARIABLES} items！`)
                    return
                  }
                  newIdRef.current = UUID()
                  const newItem = {
                    name: '',
                    description: '',
                    type: 'json',
                    id: newIdRef.current
                  }
                  setState(draft => {
                    draft.tableData = [...draft.tableData, newItem]
                    // isNew = true
                    // draft.editingKey = newIdRef.current
                  })
                  edit(newItem, state.tableData.length, true)
                  setTimeout(() => {
                    // const table = ReactDOM.findDOMNode(tableRef.current)
                    // const tableBody = table?.querySelector('.ant-table-body')
                    // if(tableBody.scrollHeight > tableBody.clientHeight) {
                    // 	tableBody.scrollTop = tableBody.scrollHeight
                    // }
                  }, 0)
                }
              }}
            >New</Button>
          </div>
          <div className={styles.ioTable}>
            <Form form={form} component={false}>
              <Table
                ref={tableRef}
                components={{ body: { cell: EditableCell } }}
                dataSource={tableData}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={false}
              />
            </Form>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ScriptIO
