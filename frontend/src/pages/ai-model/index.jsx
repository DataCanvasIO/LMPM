import React, { useEffect, useState } from 'react'
import { useImmer } from 'use-immer'
import { Button, Modal, message, Input, Pagination, Dropdown, Tooltip, Typography, Spin } from 'antd'
import imgUrl from '@/assets/default.svg'
import { IconFont } from 'components/icon'
import Add from './components/add'
import { PlusOutlined } from '@ant-design/icons'
import FieldSort from 'components/field-sort'
import { getModelList, deleteModel, defaultModel } from '@/services/aiModel'
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { formatTimeStamp, debounceFn } from '@/utils'
import Empty from 'components/empty'
import styles from './index.less'

const AIModel = () => {
  const [params, setParams] = useImmer({
    pageIndex: 1,
    pageNum: 10,
    orderKey: 'update_time',
    orderBy: '',
    keyWords: ''
  })
  const [state, setState] = useImmer({
    aiModelList: [],
    count: 0,
    editId: '',
    editName: '',
    isFlow: false,
    contentLoading: false,
  })
  const [addModalKey, setAddModalKey] = useState('OpenAI')
  const [modelVisible, setModelVisible] = useState(false)

  useEffect(() => {
    getModelListData()
  }, [params])

  const showNewModel = (key) => {
    setModelVisible(true)
    setAddModalKey(key)
    setState((prev) => {
      prev.editId = ''
    })
  }

  const items = [
    {
      key: 'Alaya',
      label: (
        <div onClick={showNewModel.bind(null, 'Alaya')}>
          Alaya
        </div>
      ),
    },
    {
      key: 'OpenAI',
      label: (
        <div onClick={showNewModel.bind(null, 'OpenAI')}>
          OpenAI
        </div>
      ),
    },
    {
      key: 'Others',
      label: (
        <div onClick={showNewModel.bind(null, 'Others')}>
          Others
        </div>
      ),
    }
  ]

  const getModelListData = async () => {
    let copyParams = {}
    for(let key in params) {
      if(params[key]) {
        copyParams[key] = params[key]
      }
    }
    setState((prev) => {
      prev.contentLoading = true
    })
    const res = await getModelList(copyParams)
    let data = res.rows ? res.rows : []
    setState({
      aiModelList: data.map((item) => ({
        name: item.name,
        url: item.url,
        id: item.id,
        isFlow: item.flow_ref,
        is_default: item.is_default,
        updateTime: item.update_time,
      })),
      count: res.count,
      contentLoading: false,
    })
  }

  const deleteModelItem = async (id) => {
    const res = await deleteModel({ id })
    return res
  }

  const deleteModelList = (item) => {
    if(!item.is_default) {
      Modal.confirm({
        content: 'Are you sure delete ?',
        onOk: async () => {
          const res = await deleteModelItem(item.id)
          if(res) {
            message.success('Delete Success')
            getModelListData()
          }
        }
      })
    }
  }

  const changeOrder = (by) => {
    setParams(draft => {
      draft.orderBy = by
    })
  }

  const changeVisible = () => {
    setModelVisible(false)
  }

  const saveModelData = () => {
    changeVisible()
    getModelListData()
  }

  const editModelList = (item) => {
    setState((prev) => {
      prev.editId = item.id
      prev.editName = item.name
      prev.isFlow = item.isFlow
    })
    setAddModalKey('Others')
    setModelVisible(true)
  }

  const searchModelList = (name) => {
    if(params.pageIndex === 1) {
      setParams((prev) => {
        prev.keyWords = name
      })
    } else {
      setParams((prev) => {
        prev.keyWords = name
        prev.pageIndex = 1
      })
    }
  }

  const changeModelName = (e) => {
    searchModelList(e.target.value)
  }

  const changeModelPage = (page, pageSize) => {
    setParams((prev) => {
      prev.pageIndex = page
      prev.pageNum = pageSize
    })
  }

  const changePageSize = (current, pageSize) => {
    setParams((prev) => {
      prev.pageIndex = current
      prev.pageNum = pageSize
    })
  }

  const defaultModelItem = async (item) => {
    Modal.confirm({
      content: 'Do you want to make this model the default?',
      onOk: async () => {
        const res = await defaultModel({id: item.id})
        if(res) {
          message.success('Default Success')
          if(params.pageIndex !== 1) {
            setParams((prev) => {
              prev.pageIndex = 1
            })
          } else {
            getModelListData()
          }
        }
      }
    })
  }

  return (
    <div className={styles.aiModelContainer}>
      <div className={styles.modelHeader}>
        <div className={styles.title}>
          <IconFont type="icon-Model" className={styles.titleIcon}/>
          <span>AI Model</span>
        </div>
        <div className={styles.searchContainer}>
          <Input
            placeholder="Search model name..."
            onInput={debounceFn(changeModelName, 400)}
            suffix={<SearchOutlined />}
          />
          <Dropdown menu={{ items }}>
            <Button type='primary' icon={<PlusOutlined />} className={styles.addNewBtn}>Add</Button>
          </Dropdown>
        </div>
      </div>
      <div className={styles.aiModelList}>
        <div className={styles.listTitle}>
          <FieldSort
            field="Updated time"
            onChange={changeOrder}
          />
        </div>
        {state.contentLoading && <Spin style={{ position: 'absolute', left: 'calc(50% - 16px)', top: 'calc(50% - 16px)' }} size="large" />}
        {!state.contentLoading && state.aiModelList.length === 0 && <div className={styles.empty}><Empty /></div>}
        {!state.contentLoading && state.aiModelList.length > 0 && state.aiModelList.map((item) => (
          <div className={styles.modelItem}>
            {item.is_default && (
              <div className={styles.modelDefaultImg}>
                <img src={imgUrl}/>
              </div>
            )}
            <div className={styles.modelTitle}>
              <span>{item.name}</span>
              <div className={styles.modelHandle}>
                {item.is_default
                  ? <CheckCircleOutlined className={styles.default} style={{ cursor: 'not-allowed' }}/>
                  : (
                    <Tooltip title="Default" placement='top'>
                      <IconFont onClick={defaultModelItem.bind(null, item)} type="icon-default2"/>
                    </Tooltip>
                  )
                }
                <Tooltip title="Edit" placement='top'>
                  <IconFont
                    type="icon-bianji"
                    className={styles.edit}
                    onClick={editModelList.bind(null, item)}
                  />
                </Tooltip>
                <Tooltip
                  overlayInnerStyle={{ width: item.is_default ? 140 : 60 }}
                  title={item.is_default ? "The default model cannot be deleted" : "Delete"}
                  placement='top'
                >
                  <IconFont
                    type="icon-shanchu"
                    className={`${item.is_default ? styles.notDelete : styles.delete}`}
                    style={{ cursor: item.is_default ? 'not-allowed' : 'pointer' }}
                    onClick={deleteModelList.bind(null, item)}
                  />
                </Tooltip>
              </div>
            </div>
            <div className={styles.modelDesc}>
              <div className={styles.modelUrl}>
                <Tooltip placement="top" title={'URL'}>
                  <IconFont type="icon-lianjie" style={{ marginRight: 5, cursor: 'pointer' }}/>
                </Tooltip>
                <Typography.Text ellipsis={{ tooltip: item.url }} style={{ width: 425 }}>
                  <span style={{ color: 'rgba(15,15,15,0.65)' }}>
                    {item.url}
                  </span>
                </Typography.Text>
              </div>
              <div className={styles.modelTime}>
                <Tooltip placement="top" title="Updated Time">
                  <IconFont type="icon-shijian" style={{ marginRight: 5, cursor: 'pointer' }}/>
                </Tooltip>
                <span>
                  {formatTimeStamp(item.updateTime, true)}
                </span>
              </div>
            </div>
          </div>
        ))}
        {state.aiModelList.length > 0 && (
          <Pagination
            className={styles.pagerContain}
            current={params.pageIndex}
            total={state.count}
            pageSize={params.pageNum}
            pageSizeOptions={[10,20,40,80]}
            showSizeChanger
            onChange={changeModelPage}
            onShowSizeChange={changePageSize}
          />
        )}
      </div>
        <Add
          editName={state.editName}
          editId={state.editId}
          isFlow={state.isFlow}
          visible={modelVisible}
          changeVisible={changeVisible}
          modelKey={addModalKey}
          saveModelData={saveModelData}
        />
    </div>
  )
}

export default AIModel
