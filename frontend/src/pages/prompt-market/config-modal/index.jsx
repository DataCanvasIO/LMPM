import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Modal, Table, Input, Form, Typography, Button, message, Tooltip } from 'antd'
import { PlusOutlined, MenuOutlined, FormOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useImmer } from 'use-immer'
import { arrayMoveImmutable } from 'array-move'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import { getUuid, debounceFn } from 'utils'
import { postCategoryList, validatePrompt } from 'services/promptMarket'
import styles from './index.less'

const { Search } = Input

const DragHandle = SortableHandle(() => <MenuOutlined className={styles.dragIcon} />)
const SortableItem = SortableElement(props => <tr {...props} />)
const SortableBody = SortableContainer(props => <tbody {...props} />)

const ConfigModal = (props) => {
  const tableRef = useRef(null)
  const [form] = Form.useForm()
  const { configOpen, closeModal, type, tags } = props
  const [state, setState] = useImmer({
    editId: '',
    searchValue: '',
    data: [],
  })

  useEffect(() => {
    setState(draft => {
      draft.data = tags
    })
  }, [tags])

  const onSearchChange = e => {
    setState(draft => {
      draft.searchValue = e.target.value
      if (draft.editId !== '') {
        const record = draft.data.find(cur => cur.id === draft.editId)
        const recordIndex = draft.data.findIndex(cur => cur.id === draft.editId)
        const newData = [...draft.data]
        if (record.new) {
          newData.splice(recordIndex, 1)
        }
        draft.editId = ''
        draft.data = newData.map((cur, index) => ({ ...cur, order_id: index }))
      }
    })
  }

  const onEdits = record => {
    form.setFieldsValue(record)
    setState(draft => {
      draft.editId = record.id
    })
  }

  const onDeletes = (record, deleteType) => {
    if (type === 'Label') {
      const index = state.data.findIndex(x => x.id === record.id)
      setState(draft => {
        const newData = [...draft.data]
        if (record.new || deleteType === 'delete') {
          newData.splice(index, 1)
        }
        draft.editId = ''
        draft.data = newData.map((cur, index) => ({ ...cur, order_id: index }))
      })
    } else {
      let content = ''
      if (type === 'Scene') {
        content = `After you delete this scene, all prompts of this scene will be moved to "Others", Do you want to continue?`
      } else {
        content = `After you delete this role, all prompts of this role will be moved to "None", Do you want to continue?`
      }
      validatePrompt({ id: record.id }).then(res => {
        if (res && deleteType === 'delete') {
          Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content,
            cancelText: "Cancel",
            okText: "OK",
            onOk() {
              const index = state.data.findIndex(x => x.id === record.id)
              setState(draft => {
                const newData = [...draft.data]
                newData.splice(index, 1)
                draft.editId = ''
                draft.data = newData.map((cur, index) => ({ ...cur, order_id: index }))
              })
            }
          })
        } else {
          const index = state.data.findIndex(x => x.id === record.id)
          setState(draft => {
            const newData = [...draft.data]
            if (record.new || deleteType === 'delete') {
              newData.splice(index, 1)
            }
            draft.editId = ''
            draft.data = newData.map((cur, index) => ({ ...cur, order_id: index }))
          })
        }
      })
    }
  }

  const onCancel = record => {
    onDeletes(record, 'cancel')
  }

  const save = async record => {
    const { id } = record
    const row = await form.validateFields()
    const index = state.data.findIndex((item) => id === item.id)
    const curData = state.data[index]
    setState(draft => {
      const newData = [...draft.data]
      newData.splice(index, 1, { ...curData, ...row })
      draft.data = newData.map((cur, index) => {
        delete cur.new
        return { ...cur, order_id: index }
      })
      draft.editId = ''
    })
  }

  const handleOk = () => {
    if (state.editId !== '') {
      message.error(`You have not saved the ${type}, please confirm after saving!`)
    } else {
      postCategoryList({ type: type.toLowerCase(), category_list: state.data }).then(() => {
        closeModal('update')
      })
    }
  }

  const columns = [
    {
      title: `${type} Name`,
      dataIndex: 'name',
      editable: true,
      width: type === 'Role' ? 236 : 436,
      render: text => (
        <Typography.Text ellipsis={{ tooltip: text }} style={{ width: type === 'Role' ? '220px' : '420px' }}>{text}</Typography.Text>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      editable: false,
      width: type === 'Role' ? 116 : 316,
      render: text => (
        <Typography.Text ellipsis={{ tooltip: text }} style={{ width: type === 'Role' ? '100px' : '300px' }}>{text}</Typography.Text>
      ),
    },
    type === 'Role' ? {
      title: 'Role Prompt',
      dataIndex: 'role_prompt',
      editable: true,
      width: 400,
      render: text => (
        <Typography.Text ellipsis={{ tooltip: text }} style={{ width: '384px' }}>{text}</Typography.Text>
      ),
    } : null,
    {
      title: 'Actions',
      dataIndex: 'operation',
      width: 93,
      render: (_, record) => {
        return record.id === state.editId ? (
          <div style={{ width: '77px' }}>
            <Typography.Link onClick={() => save(record)} style={{ marginRight: 8 }} >
              <CheckCircleOutlined />
            </Typography.Link>
            <Typography.Link onClick={() => onCancel(record)} >
              <CloseCircleOutlined />
            </Typography.Link>
          </div>
        ) : (
          <div style={{ width: '77px' }}>
            <Typography.Link style={{ marginRight: 8 }} disabled={state.editId !== '' || record.source === 'system'} onClick={state.editId === '' && record.source !== 'system' ? () => onEdits(record) : () => {}}>
              {record.source === 'system' && (
                <Tooltip title={`Preset ${type}s cannot be edited`}>
                  <FormOutlined />
                </Tooltip>
              )}
              {record.source !== 'system' && (
                <FormOutlined />
              )}
            </Typography.Link>
            <Typography.Link disabled={state.editId !== '' || record.source === 'system'} onClick={state.editId === '' && record.source !== 'system' ? () => onDeletes(record, 'delete') : () => {}}>
              {record.source === 'system' && (
                <Tooltip title={`Preset ${type}s cannot be deleted`}>
                  <DeleteOutlined />
                </Tooltip>
              )}
              {record.source !== 'system' && (
                <DeleteOutlined />
              )}
            </Typography.Link>
          </div>
        )
      },
    },
    {
      title: '',
      dataIndex: 'sort',
      width: 50,
      className: 'drag-visible',
      render: (_, record) => {
        return record.id === state.editId
          ? <MenuOutlined className={`${styles.dragIcon} ${styles.dragDisabled}`} />
          : <DragHandle />
      },
    },
  ]

  const mergedColumns = columns.filter(col => col !== null).map(col => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: record => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: record.id === state.editId,
      }),
    }
  })

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(state.data.slice(), oldIndex, newIndex).filter(el => !!el)
      setState(draft => {
        draft.data = newData.map((cur, index) => ({ ...cur, order_id: index }))
      })
    }
  }

  const DraggableContainer = restProps => (
    <SortableBody
      useDragHandle
      // disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...restProps}
    />
  )

  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    const index = state.data.findIndex(x => x.id === restProps['data-row-key'])
    return <SortableItem index={index} {...restProps} />
  }

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    record,
    index,
    children,
    ...restProps
  }) => {
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              { required: true, message: `Please input something.` },
              {
                validator: (_, value) => state.data.findIndex(cur => cur.name === value && cur.id !== record.id) === -1 ? Promise.resolve() : Promise.reject(),
                message: 'Name already exists!'
              },
              {
                validator: (_, value) => (value.length <= 30 || dataIndex !== 'name') ? Promise.resolve() : Promise.reject(),
                message: 'Exceeded the character limit'
              }
            ]}
          >
            <Input autocomplete='off' size='small' />
          </Form.Item>
        ) : children}
      </td>
    )
  }

  return (
    <Modal
      key='config'
      title={`Configure ${type} Filters`}
      open={configOpen}
      onOk={handleOk}
      onCancel={() => { closeModal() }}
      maskClosable={false}
      destroyOnClose
      width={960}
      cancelText="Cancel"
      okText="OK"
    >
      <div className={styles.configMian}>
        <div className={styles.mainTop}>
          <div className={styles.mainTopSearch}>
            <Search
              placeholder={`Search ${type} Name`}
              allowClear
              onChange={debounceFn(onSearchChange, 400)}
              style={{ width: 284 }}
            />
          </div>
          <div className={styles.mainTopNew}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={state.editId !== ''}
              onClick={() => {
                if (state.editId !== '') {
                  message.warning('Please save the edited items before adding them!')
                } else {
                  const newItem = {
                    id: getUuid(),
                    name: '',
                    source: 'user',
                    order_id: state.data.length,
                    new: true,
                    type: type.toLowerCase(),
                  }
                  if (type === 'Role') {
                    newItem.role_prompt = ''
                  }
                  setState(draft => {
                    draft.data = [newItem, ...draft.data]
                    draft.editId = newItem.id
                  })
                  onEdits(newItem)
                  setTimeout(() => {
                    //设置滚动条到最顶端
                    const table = ReactDOM.findDOMNode(tableRef.current)
                    const tableBody = table?.querySelector('.ant-table-body')
                    tableBody.scrollTop = 0
                  }, 0)
                }
              }}
            >New</Button>
          </div>
        </div>
        <div className={styles.mainBottom}>
          <Form form={form} component={false}>
            <Table
              ref={tableRef}
              size='middle'
              className='mlpm-table'
              components={{ body: { cell: EditableCell, wrapper: DraggableContainer, row: DraggableBodyRow } }}
              dataSource={state.data.filter(cur => cur.id === state.editId || cur.name.toLowerCase().includes(state.searchValue.toLowerCase()))}
              scroll={{ x: false, y: '40vh' }}
              columns={mergedColumns}
              rowClassName="editable-row"
              pagination={false}
              rowKey="id"
            />
          </Form>
        </div>
      </div>
    </Modal>
  )
}

export default ConfigModal
