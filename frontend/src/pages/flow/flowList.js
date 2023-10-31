import React, { useEffect } from 'react'
import { useImmer } from 'use-immer'
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Pagination, Input, Modal, Typography, Tooltip, Spin } from 'antd'
import { history } from 'umi'
import { getFlowList, deleteFlow } from '../../services/flow'
import FlowModal from './components/flowModal'
import { formatTimeStamp, debounceFn } from '../../utils'
import { IconFont} from 'components/icon'
import Empty from 'components/empty'
import styles from './index.less'

const FlowList = (props) => {
  const [state, setState] = useImmer({
    list: [],
    pageIndex: 1,
    pageNum: 10,
    total: 0,
    orderKey: 'update_time',
    orderBy: 'desc',
    keyWords: '',
    visible: false,
    currData: null,
    modalType: 'create',
    isLoading: false,
  })

  const {
    pageIndex,
    pageNum,
    orderKey,
    orderBy,
    keyWords
  } = state

  const queryList = () => {
    const params = {
      pageIndex,
      pageNum,
      orderKey,
      orderBy,
      keyWords
    }
    setState(draft => {
     draft.isLoading = true
    })
    getFlowList({...params}).then(res => {
      setState(draft => {
        draft.list = res.rows
        draft.total = res.count
        draft.isLoading = false
      })
    })
    // createFlow({name: 'sss', 'description': 'xxxx'}).then(res => {
    //   console.log(res)
    // })
  }

  const handleModalVisible = (v) => {
    setState(d => {
      d.visible = v
    })
  }

  const handleOpenModal = (item, type) => {
    handleModalVisible(true)
    setState(draft => {
      draft.currData = item
      draft.modalType = type
    })
  }

  const handleDelete = (item) => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this data?',
      cancelText: "Cancel",
      okText: "OK",
      onOk() {
        return deleteFlow({id: item.id}).then(res => {
          if (state.list.length === 1 && pageIndex > 1) {
            // setState(d => d.pageIndex --)
            setState(d => {
              d.pageIndex = pageIndex - 1
            })
          } else {
            queryList()
          }
        })
      },
    })
  }

  const goto = (item) => {
    history.push(`/flowEdit/${item.id}`)
  }

  const renderItem = (item) => {
    const disabled = item.published === 1
    return (
      <div className={styles.listItem}>
        <div className={styles.itemTitle}>
          <Typography.Paragraph ellipsis={{rows: 1,  tooltip: item.name }} style={{ width: '36%' }}>
             <a onClick={() => goto(item)}>{item.name}</a>
          </Typography.Paragraph>
          <div className={styles.operations}>
            <Tooltip title={disabled ? <>Pubished flow can not be edit. You can make <br/> a copy to edit and publish again.</> : "Edit Flow"}>
              <IconFont type="icon-bianji" onClick={disabled ? null : () => goto(item)} className={disabled ? styles.disabled : ''}/>
            </Tooltip>
            <Tooltip title="Copy Flow">
              <IconFont type="icon-fuzhi" onClick={() => handleOpenModal(item, 'copy')} />
            </Tooltip>
            <Tooltip title={disabled ? "Published flow can not be published" : "Publish App"}>
              <IconFont type="icon-publish1" onClick={disabled ? null : () => handleOpenModal(item, 'publish')} className={disabled ? styles.disabled : ''}/>
            </Tooltip>
            <Tooltip title={disabled ? "Published flow can not be deleted" : "Delete Flow"}>
              <IconFont type="icon-shanchu" onClick={disabled ? null : () => handleDelete(item)} className={disabled ? styles.disabled : ''}/>
            </Tooltip>
          </div>
        </div>
        <div className={styles.itemBottom}>
          <div className={styles.botLeft}>
              <div className={styles.pCount}>
                <Tooltip title={`Prompt Count`}>
                  <IconFont type="icon-prompt" style={{fontSize: 16, verticalAlign: 'text-bottom', marginRight: 8}}/>
                </Tooltip>
                <span className={styles.count}>{item.prompt_count ?? 0}</span>
                <span className={styles.text}>{item.prompt_count > 1 ? 'prompts' : 'prompt'}</span>
              </div>
              <div className={styles.time}>
                <Tooltip title={`Updated Time`}>
                  <IconFont type="icon-shijian" style={{fontSize: 16, verticalAlign: 'text-bottom', marginRight: 8}}/>
                </Tooltip>
                {formatTimeStamp(item.update_time, true)}
              </div>
              <div className={styles.time}>
                <Tooltip title={`App Name`}>
                  <IconFont type="icon-a-promptapp"  style={{fontSize: 15, verticalAlign: 'text-bottom', marginRight: 8}} />
                </Tooltip>
                {item.app_name ?? '--'}
              </div>
          </div>
        </div>
        <div className={styles.itemDesc}>
          <Typography.Paragraph ellipsis={{rows: 2,  tooltip: item.description }}>
            {item.description}
          </Typography.Paragraph>
        </div>
      </div>
    )
  }

  const changeOrder = (key, by) => {
    setState(draft => {
      draft.orderBy = by
      draft.orderKey = key
    })
  }

  const handleOrder = (orderKey) => {
    if (orderKey === state.orderKey) {
      if (state.orderBy === 'asc') {
        changeOrder(orderKey, 'desc')
      } else if (state.orderBy === 'desc') {
        changeOrder(null, null)
      } else {
        changeOrder(orderKey, 'asc')
      }
    } else {
      changeOrder(orderKey, 'asc')
    }
  }

  const getOrderStyle = (currKey, currBy) => {
    if (currKey === state.orderKey && currBy === state.orderBy) {
      return styles.active
    }
    return null
  }

  const handleSearch = (e) => {
    setState(draft => {
      draft.pageIndex = 1
      draft.keyWords = e.target.value
    })
  }

  useEffect(() => {
    queryList()
  }, [pageIndex, pageNum, orderKey, orderBy, keyWords])

  return (
    <div className={styles.flowList}>
      <div  className={styles.title}>
        <div className={styles.titleLeft}>
          <IconFont type="icon-flow"  style={{marginRight: 8, fontSize: 20, verticalAlign: 'text-bottom'}}/>
          <span>Flow</span>
        </div>
        <div className={styles.titleRight}>
          <Input
            placeholder="Search flow name"
            className={styles.searchInput}
            onInput={debounceFn(handleSearch, 400)}
            suffix={<SearchOutlined style={{ color: 'rgba(15,15,15,0.15)', cursor: 'pointer' }} />}
          />
          <Button type="primary" style={{ marginLeft: '36px', borderRadius: '8px', height: '38px' }} icon={<PlusOutlined />} onClick={() => handleOpenModal(null, 'create')}>New</Button>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.filter}>
           <div className={styles.filterItem} onClick={() => handleOrder('prompt_count')}>
             <span>Prompt count</span>
             <div className={styles.orderIcon}>
                <CaretUpOutlined className={getOrderStyle('prompt_count', 'asc')} />
                <CaretDownOutlined  className={getOrderStyle('prompt_count', 'desc')}/>
             </div>
          </div>
          <div className={styles.filterItem} onClick={() => handleOrder('update_time')}>
            <span>Updated time</span>
            <div className={styles.orderIcon} >
              <CaretUpOutlined className={getOrderStyle('update_time', 'asc')} />
              <CaretDownOutlined  className={getOrderStyle('update_time', 'desc')} />
            </div>
          </div>
        </div>
        {
          state.list.length > 0 && !state.isLoading && (
            <div className={styles.listWrapper}>
              {state.list.map(item => renderItem(item))}
            </div>
          )
        }
        {
          state.isLoading && <div className={styles.loading}>
            <Spin size="large" />
          </div>
        }
        {
          state.list.length === 0 && !state.isLoading && <div className={styles.empty}>
            <Empty />
          </div>
        }
        <div className={styles.pagi}>
          <Pagination
            total={state.total}
            current={state.pageIndex}
            pageSize={state.pageNum}
            totalBoundaryShowSizeChanger
            pageSizeOptions={[10,20,40,80]}
            onChange={(page, pageSize) => {
              setState(draft => {
                draft.pageIndex = page
                draft.pageNum = pageSize
              })
            }}
          />
        </div>
      </div>
      {state.visible && (
        <FlowModal
          visible={state.visible}
          currData={state.currData}
          modalType={state.modalType}
          handleModalVisible={handleModalVisible}
          queryList={queryList}
        />
      )}
    </div>
  )
}

export default FlowList
