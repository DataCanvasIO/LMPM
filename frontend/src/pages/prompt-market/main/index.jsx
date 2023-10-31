import React, { useEffect } from 'react'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, Row, Col, Pagination, Spin } from 'antd'
import FieldSort from 'components/field-sort'
import { useImmer } from 'use-immer'
import NewModal from '../new-modal'
import { IconFont } from 'components/icon'
import DetailModal from '../detail-modal'
import PromptCard from '../prompt-card'
import TagsFilter from '../tags-filter'
import { debounceFn } from 'utils'
import Empty from 'components/empty'
import { getPromptList, deletePrompt } from 'services/promptMarket'
import styles from './index.less'

const PromptMarket = () => {
  const [state, setState] = useImmer({
    spanNum: 6,
    current: 1,
    pageSize: 12,
    searchValue: '',
    sceneActive: 'ALL',
    roleActive: 'ALL',
    labelActive: 'ALL',
    promptCount: 0,
    promptList: [],
    detailModalVisible: false,
    newModalVisible: false,
    editPrompt: null,
    updateSort: 'desc', // asc
    contentLoading: false,
  })

  useEffect(() => {
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    getPrompt()
  }, [state.searchValue, state.roleActive, state.sceneActive, state.labelActive, state.updateSort, state.current, state.pageSize])

  const getPrompt = () => {
    setState(draft => {
      draft.contentLoading = true
    })
    getPromptList({
      keywords: state.searchValue,
      role_id: state.roleActive,
      scene_id: state.sceneActive,
      labels_ids: state.labelActive,
      orderKey: 'update_time',
      orderBy: state.updateSort,
      pageIndex: state.current,
      pageNum: state.pageSize
    }).then(res => {
      setState(draft=> {
        draft.promptList = res.rows
        draft.promptCount = res.count
        draft.contentLoading = false
      })
    })
  }

  const onSearch = e => {
    setState(draft => {
      draft.searchValue = e.target.value
      draft.current = 1
    })
  }

  const onResize = () => {
    if (window.innerWidth >= 1920) {
      setState(draft => {
        draft.spanNum = 6
      })
    } else {
      setState(draft => {
        draft.spanNum = 8
      })
    }
  }

  return (
    <div className={styles.promptMarket}>
      <div className={styles.promptMarketTop}>
        <div className={styles.topBar}>
          <IconFont className={styles.topBarIcon} type="icon-a-promptmarket" />
          <span className={styles.topBarTitle}>Prompt Market</span>
        </div>
        <TagsFilter
          sceneActive={state.sceneActive}
          roleActive={state.roleActive}
          labelActive={state.labelActive}
          onSceneClick={value => {
            setState(draft => {
              draft.sceneActive = value
            })
          }}
          onRoleClick={value => {
            setState(draft => {
              draft.roleActive = value
            })
          }}
          onLabelClick={value => {
            setState(draft => {
              draft.labelActive = value
            })
          }}
          updateList={getPrompt}
        />
      </div>
      <div className={styles.promptMarketBottom}>
        <div className={styles.bottomMain}>
          <div className={styles.bottomOperate}>
            <div className={styles.operateLeft}>
              <FieldSort
                field="Updated time"
                onChange={value => {
                  setState(draft => {
                    draft.updateSort = value
                  })
                }}
              />
              <div className={styles.operateLeftSearch}>
                <Input
                  placeholder="Search prompt name and content..."
                  onInput={debounceFn(onSearch, 400)}
                  suffix={<SearchOutlined />}
                />
              </div>
            </div>
            <div className={styles.operateRight}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setState(draft => {
                    draft.newModalVisible = true
                  })
                }}
              >New</Button>
            </div>
          </div>
          <div className={styles.bottomContent}>
            {state.contentLoading && <Spin style={{ position: 'absolute', left: 'calc(50% - 16px)', top: 'calc(50% - 16px)' }} size="large" />}
            {!state.contentLoading && state.promptList.length > 0 && (
              <Row>
                {state.promptList.map((cur, ind) => (
                  <Col key={`${cur.id}${ind}`} span={state.spanNum}>
                    <PromptCard
                      prompt={cur}
                      onClick={() => {
                        setState(draft => {
                          draft.detailModalVisible = true
                          draft.editPrompt = cur
                        })
                      }}
                      onEdit={() => {
                        setState(draft => {
                          draft.editPrompt = cur
                          draft.newModalVisible = true
                        })
                      }}
                      onDelete={() => {
                        deletePrompt({ id: cur.id }).then(() => {
                          if (state.promptList.length === 1 && state.current !== 1) {
                            setState(draft => {
                              draft.current = draft.current - 1
                            })
                          } else {
                            getPrompt()
                          }
                        })
                      }}
                    />
                  </Col>
                ))}
              </Row>
            )}
            {!state.contentLoading && state.promptList.length === 0 && (
              <Empty />
            )}
          </div>
          <div className={styles.bottomPagination}>
            <Pagination
              total={state.promptCount}
              current={state.current}
              pageSize={state.pageSize}
              showSizeChanger
              pageSizeOptions={[12, 24, 36, 48]}
              onChange={(page, pageSize) => {
                setState(draft => {
                  draft.current = page
                  draft.pageSize = pageSize
                })
              }}
            />
          </div>
        </div>
      </div>
      {state.newModalVisible && (
        <NewModal
          initValue={state.editPrompt}
          newOpen={state.newModalVisible}
          sceneList={state.sceneTags}
          roleList={state.roleTags}
          labelList={state.labelTags}
          closeModal={(type) => {
            if(type === 'update') {
              getPrompt()
            }
            setState(draft => {
              draft.newModalVisible = false
              draft.editPrompt = null
            })
          }}
        />
      )}
      {state.detailModalVisible && (
        <DetailModal
          curPrompt={state.editPrompt}
          detailOpen={state.detailModalVisible}
          closeModal={() => {
            setState(draft => {
              draft.detailModalVisible = false
              draft.editPrompt = null
            })
          }}
        />
      )}
    </div>
  )
}

export default PromptMarket
