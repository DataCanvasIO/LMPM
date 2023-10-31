import React, { useEffect, useRef } from 'react'
import { useImmer } from 'use-immer'
import { Modal, Pagination, Input, Tooltip, Typography } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons'
import FieldSort from 'components/field-sort'
import VariableModal from '../variable-modal'
import SdkModal from '../sdk-modal'
import EditModal from '../edit-modal'
import { copyValue } from 'utils/variable'
import { getAppList, deleteApp } from 'services/promptApp'
import { formatTimeStamp, debounceFn } from 'utils'
import Empty from 'components/empty'
import { IconFont } from 'components/icon'
import Run from 'components/flow-run'
import styles from './index.less'

const PromptApp = (props) => {
  const timer = useRef(null)
  const [state, setState] = useImmer({
    list: [],
    pageIndex: 1,
    pageNum: 10,
    total: 0,
    keyWords: '',
    updateSort: 'desc',
    copyKey: '',
    varVisible: false,
    sdkVisible: false,
    editVisible: false,
    activeApp: {},
  })

  useEffect(() => {
    if (state.sdkVisible) {
      timer.current && clearInterval(timer.current)
    } else {
      getPromptApp()
      timer.current = setInterval(() => {
        getPromptApp()
      }, 3000)
    }
    return () => {
      timer.current && clearInterval(timer.current)
    }
  }, [state.pageIndex, state.pageNum, state.updateSort, state.keyWords, state.sdkVisible])

  const getPromptApp = () => {
    getAppList({
      pageIndex: state.pageIndex,
      pageNum: state.pageNum,
      orderKey: 'update_time',
      orderBy: state.updateSort,
      keyWords: state.keyWords
    }).then(res => {
      setState(draft => {
        draft.list = res.rows
        draft.total = res.count
      })
    })
  }

  const onDeleteApp = (item) => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this app?',
      cancelText: "Cancel",
      okText: "OK",
      onOk() {
        deleteApp({ id: item.id }).then(() => {
          if (state.list.length === 1 && state.pageIndex !== 1) {
            setState(draft => {
              draft.pageIndex = draft.pageIndex - 1
            })
          } else {
            getPromptApp()
          }
        })
      }
    })
  }

  const onRenderItem = item => {
    let curRef = React.createRef(null)

    const showStatus = () => {
      curRef.current.changeShowStatus?.()
    }

    return (
      <div className={styles.listItem} key={item.id}>
        <div className={styles.itemTitle}>
          <span className={styles.titleName}>
            <span className={styles.nameText}>{item.name}</span>
            <Run showStatus flowId={item.flow_id} isList listStatus={item.flow_status} ref={curRef} name={item.name}/>
          </span>
          <div className={styles.operations}>
            <Run flowId={item.flow_id} isList listStatus={item.flow_status} handleShowStatus={showStatus} name={item.name}/>
            <Tooltip title='Edit'>
              <IconFont
                type="icon-bianji"
                onClick={() => {
                  setState(draft => {
                    draft.activeApp = item
                    draft.editVisible = true
                  })
                }}
              />
            </Tooltip>
            <Tooltip title='SDK'>
              <IconFont
                type="icon-SDK"
                onClick={() => {
                  setState(draft => {
                    draft.activeApp = item
                    draft.sdkVisible = true
                  })
                }}
              />
            </Tooltip>
            <Tooltip title='Delete'>
              <IconFont
                type="icon-shanchu"
                onClick={() => onDeleteApp(item)}
              />
            </Tooltip>
          </div>
        </div>
        <div className={styles.itemBottom}>
          <div className={styles.bottomInfo}>
              <div className={`${styles.info} ${styles.infoPadding}`}>
                <Tooltip placement="top" title={`URL`}>
                  <IconFont type="icon-lianjie" className={styles.icon} />
                </Tooltip>
                <Tooltip title={item.url || '--'} placement="top">
                  <span className={styles.path}>{item.url || '--'}</span>
                </Tooltip>
                <span className={styles.copy}>
                  {item.id === state.copyKey && <CheckCircleOutlined className={styles.iconFont} />}
                  {item.id !== state.copyKey && (
                    <IconFont
                      type="icon-fuzhi"
                      onClick={() => {
                        copyValue(item.url)
                        setState(draft => {
                          draft.copyKey = item.id
                        })
                        setTimeout(() => {
                          setState(draft => {
                            draft.copyKey = ''
                          })
                        }, 1500)
                      }}
                    />
                  )}
                </span>
              </div>
              <div className={`${styles.info} ${styles.infoPadding}`}>
                <Tooltip placement="top" title={`Flow`}>
                  <IconFont type="icon-flow" className={styles.icon} />
                </Tooltip>
                <Tooltip placement="top" title={item.flow_description || '--'}>
                  <span>{item.flow_name || '--'}</span>
                </Tooltip>
              </div>
              <div className={`${styles.info} ${styles.infoPadding}`}>
                <Tooltip placement="top" title={`Input variables`}>
                  <IconFont type="icon-bianliang" className={styles.icon} />
                </Tooltip>
                <Typography.Text
                  ellipsis={{
                    tooltip: Object.prototype.toString.call(item.input_info) === "[object String]"
                      ? item.input_info || '--'
                      : item.input_info?.map(cur => cur.variable).join(' | ') || '--',
                    rows: 1
                  }}
                  className={styles.tableType}
                >
                  <span
                    className={styles.link}
                    onClick={() => {
                      setState(draft => {
                        draft.activeApp = item
                        draft.varVisible = true
                      })
                    }}
                  >
                    {
                      Object.prototype.toString.call(item.input_info) === "[object String]"
                        ? item.input_info || '--'
                        : item.input_info?.map(cur => cur.variable).join(' | ') || '--'
                    }
                  </span>
                </Typography.Text>
              </div>
              <div className={styles.info}>
                <Tooltip placement="top" title={`Updated Time`}>
                  <IconFont type="icon-shijian" className={styles.icon} />
                </Tooltip>
                {formatTimeStamp(item.update_time, true) || '--'}
              </div>
          </div>
        </div>
      </div>
    )
  }

  const onChange = e => {
    setState(draft => {
      draft.pageIndex = 1
      draft.keyWords = e.target.value
    })
  }

  return (
    <div className={styles.appList}>
      <div className={styles.title}>
        <div className={styles.titleLeft}>
          <IconFont type="icon-a-promptapp" className={styles.titleIcon} />
          <span className={styles.titleText}>Prompt App</span>
        </div>
        <div className={styles.titleRight}>
          <Input
            placeholder="Search app name..."
            onInput={debounceFn(onChange, 400)}
            suffix={<SearchOutlined />}
          />
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.filter}>
          <FieldSort
            field="Updated time"
            onChange={value => {
              setState(draft => {
                draft.updateSort = value
              })
            }}
          />
        </div>
        {state.list.length > 0 ? (
          <div>{state.list.map(item => onRenderItem(item))}</div>
        ) : (
          <div className={styles.empty}><Empty /></div>
        )}
        <div className={styles.pagi}>
          <Pagination
            total={state.total}
            current={state.pageIndex}
            pageSize={state.pageNum}
            showSizeChanger
            showQuickJumper
            pageSizeOptions={[10, 20, 40, 80]}
            onChange={(page, pageSize) => {
              setState(draft => {
                draft.pageIndex = page
                draft.pageNum = pageSize
              })
            }}
          />
        </div>
      </div>
      {state.varVisible && (
        <VariableModal
          variableOpen={state.varVisible}
          activeApp={state.activeApp}
          closeModal={() => {
            setState(draft => {
              draft.varVisible = false
              draft.activeApp = {}
            })
          }}
        />
      )}
      {state.sdkVisible && (
        <SdkModal
          sdkOpen={state.sdkVisible}
          id={state.activeApp.id}
          name={state.activeApp.name}
          closeModal={() => {
            setState(draft => {
              draft.sdkVisible = false
              draft.activeApp = {}
            })
          }}
        />
      )}
      {state.editVisible && (
        <EditModal
          editOpen={state.editVisible}
          id={state.activeApp.id}
          name={state.activeApp.name}
          closeModal={(type) => {
            setState(draft => {
              draft.editVisible = false
              draft.activeApp = {}
            })
            if (type === 'update') {
              getPromptApp()
            }
          }}
        />
      )}
    </div>
  )
}

export default PromptApp
