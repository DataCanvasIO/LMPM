import React, { useEffect, useRef } from 'react'
import { DownOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons'
import { Tag, Button } from 'antd'
import { IconFont } from 'components/icon'
import { useImmer } from 'use-immer'
import ConfigModal from '../config-modal'
import { getCategoryList } from 'services/promptMarket'
import styles from './index.less'

const TagsFilter = (props) => {
  const sceneRef = useRef(null)
  const roleRef = useRef(null)
  const labelRef = useRef(null)
  const { onSceneClick, sceneActive, onRoleClick, roleActive, onLabelClick, labelActive, updateList } = props
  const [state, setState] = useImmer({
    filterFold: false,
    sceneFoldShow: false,
    sceneFold: false,
    sceneLoading: false,
    roleFoldShow: false,
    roleFold: false,
    roleLoading: false,
    labelFoldShow: false,
    labelFold: false,
    labelLoading: false,
    sceneTags: [],
    roleTags: [],
    labelTags: [],
    configVisible: false,
    configType: '',
    configTags: [],
  })

  useEffect(() => {
    getTag()
  }, [])

  useEffect(() => {
    const clientWidth = sceneRef.current.getBoundingClientRect().width
    let childsWidth = 0
    sceneRef.current.childNodes.forEach(cur => {
      childsWidth += cur.getBoundingClientRect().width + 32
    })
    if(clientWidth < childsWidth) {
      setState(draft => {
        draft.sceneFoldShow = true
      })
    } else {
      setState(draft => {
        draft.sceneFoldShow = false
        draft.sceneFold = false
      })
    }
  }, [state.sceneTags])

  useEffect(() => {
    const clientWidth = roleRef.current.getBoundingClientRect().width
    let childsWidth = 0
    roleRef.current.childNodes.forEach(cur => {
      childsWidth += cur.getBoundingClientRect().width + 32
    })
    if(clientWidth < childsWidth) {
      setState(draft => {
        draft.roleFoldShow = true
      })
    } else {
      setState(draft => {
        draft.roleFoldShow = false
        draft.roleFold = false
      })
    }
  }, [state.roleTags])

  useEffect(() => {
    const clientWidth = labelRef.current.getBoundingClientRect().width
    let childsWidth = 0
    labelRef.current.childNodes.forEach(cur => {
      childsWidth += cur.getBoundingClientRect().width + 32
    })
    if(clientWidth < childsWidth) {
      setState(draft => {
        draft.labelFoldShow = true
      })
    } else {
      setState(draft => {
        draft.labelFoldShow = false
        draft.labelFold = false
      })
    }
  }, [state.labelTags])

  const getTag = (type) => {
    if (!type || type === 'Scene') {
      setState(draft => {
        draft.sceneLoading = true
      })
      getCategoryList({ type: 'scene' }).then(res => {
        setState(draft => {
          draft.sceneTags = res.rows || []
          draft.sceneLoading = false
        })
      })
    }
    if (!type || type === 'Role') {
      setState(draft => {
        draft.roleLoading = true
      })
      getCategoryList({ type: 'role' }).then(res => {
        setState(draft => {
          draft.roleTags = res.rows || []
          draft.roleLoading = false
        })
      })
    }
    if (!type || type === 'Label') {
      setState(draft => {
        draft.labelLoading = true
      })
      getCategoryList({ type: 'label' }).then(res => {
        setState(draft => {
          draft.labelTags = res.rows || []
          draft.labelLoading = false
        })
      })
    }
  }

  return (
    <div className={`${styles.topFilter} ${state.filterFold ? styles.topFilterHidden : null}`}>
      <IconFont
        className={`${styles.foldIcon} ${state.filterFold ? styles.iconRot180 : null}`}
        type="icon-shouqi1"
        onClick={() => {
          setState(draft => {
            draft.filterFold = !draft.filterFold
          })
        }}
      />
      <div className={styles.filterItem}>
        <div className={styles.filterItemTitle}>Scene :</div>
        <div className={`${styles.filterItemContent} ${state.sceneFold ? styles.filterItemContentFold : null}`} ref={sceneRef}>
          <Tag
            className={sceneActive === 'ALL' ? styles.itemTagActive : null}
            onClick={() => onSceneClick('ALL')}
          >ALL</Tag>
          {state.sceneLoading && <Tag icon={<SyncOutlined style={{ marginLeft: '8px' }} spin />} />}
          {!state.sceneLoading && state.sceneTags.map((cur, ind) => (
            <Tag
              key={`${cur.id}${ind}`}
              className={sceneActive === cur.id ? styles.itemTagActive : null}
              onClick={() => onSceneClick(cur.id)}
            >{cur.name}</Tag>
          ))}
        </div>
        {state.sceneFoldShow && (
          <div className={styles.filterItemFold}>
            <Button
              type="link"
              icon={<DownOutlined className={`${styles.iconRot} ${state.sceneFold ? styles.iconRot180 : null}`} />}
              onClick={() => {
                setState(draft => {
                  draft.sceneFold = !draft.sceneFold
                })
              }}
            >
              {state.sceneFold ? 'Fold' : 'Unfold'}
            </Button>
          </div>
        )}
        <div
          className={styles.filterItemAdd}
          onClick={() => {
            setState(draft => {
              draft.configVisible = true
              draft.configType = 'Scene'
              draft.configTags = draft.sceneTags
            })
          }}
        ><SettingOutlined /></div>
      </div>
      <div className={styles.filterItem}>
        <div className={styles.filterItemTitle}>Role :</div>
        <div className={`${styles.filterItemContent} ${state.roleFold ? styles.filterItemContentFold : null}`} ref={roleRef}>
          <Tag
            className={roleActive === 'ALL' ? styles.itemTagActive : null}
            onClick={() => onRoleClick('ALL')}
          >ALL</Tag>
          {state.roleLoading && <Tag icon={<SyncOutlined style={{ marginLeft: '8px' }} spin />} />}
          {!state.roleLoading && state.roleTags.map((cur, ind) => (
            <Tag
              key={`${cur.id}${ind}`}
              className={roleActive === cur.id ? styles.itemTagActive : null}
              onClick={() => onRoleClick(cur.id)}
            >{cur.name}</Tag>
          ))}
        </div>
        {
          state.roleFoldShow && (
            <div className={styles.filterItemFold}>
              <Button
                type="link"
                icon={<DownOutlined className={`${styles.iconRot} ${state.roleFold ? styles.iconRot180 : null}`} />}
                onClick={() => {
                  setState(draft => {
                    draft.roleFold = !draft.roleFold
                  })
                }}
              >
                {state.roleFold ? 'Fold' : 'Unfold'}
              </Button>
            </div>
          )
        }
        <div
          className={styles.filterItemAdd}
          onClick={() => {
            setState(draft => {
              draft.configVisible = true
              draft.configType = 'Role'
              draft.configTags = draft.roleTags
            })
          }}
        ><SettingOutlined /></div>
      </div>
      <div className={styles.filterItem}>
        <div className={styles.filterItemTitle}>Label :</div>
        <div className={`${styles.filterItemContent} ${state.labelFold ? styles.filterItemContentFold : null}`} ref={labelRef}>
          <Tag
            className={labelActive === 'ALL' ? styles.itemTagActive : null}
            onClick={() => onLabelClick('ALL')}
          >ALL</Tag>
          {state.labelLoading && <Tag icon={<SyncOutlined style={{ marginLeft: '8px' }} spin />} />}
          {!state.labelLoading && state.labelTags.map((cur, ind) => (
            <Tag
              key={`${cur.id}${ind}`}
              className={labelActive === cur.id ? styles.itemTagActive : null}
              onClick={() => onLabelClick(cur.id)}
            >{cur.name}</Tag>
          ))}
        </div>
        {state.labelFoldShow && (
          <div className={styles.filterItemFold}>
            <Button
              type="link"
              icon={<DownOutlined className={`${styles.iconRot} ${state.labelFold ? styles.iconRot180 : null}`} />}
              onClick={() => {
                setState(draft => {
                  draft.labelFold = !draft.labelFold
                })
              }}
            >
              {state.labelFold ? 'Fold' : 'Unfold'}
            </Button>
          </div>
        )}
        <div
          className={styles.filterItemAdd}
          onClick={() => {
            setState(draft => {
              draft.configVisible = true
              draft.configType = 'Label'
              draft.configTags = draft.labelTags
            })
          }}
        ><SettingOutlined /></div>
      </div>
      {state.configVisible && (
        <ConfigModal
          type={state.configType}
          tags={state.configTags}
          configOpen={state.configVisible}
          closeModal={(type) => {
            if (type === 'update') {
              getTag(state.configType)
              updateList()
            }
            setState(draft => {
              draft.configVisible = false
              draft.configType = ''
              draft.configTags = []
            })
          }}
        />
      )}
    </div>
  )
}

export default TagsFilter
