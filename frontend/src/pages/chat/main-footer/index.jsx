import React, { useEffect, useMemo, useRef } from 'react'
import { Mentions, Input, List, Empty, Tooltip, message } from 'antd'
import { IconFont } from 'components/icon'
import { useImmer } from 'use-immer'
import { parseTempVar } from 'utils/variable'
import VarModal from '../variable-modal'
import { getPromptGroup, getPromptAll } from 'services/chat'
import styles from './index.less'

const iconMap = {
  Daily: <IconFont type="icon-Daily" />,
  Office: <IconFont type="icon-Offic" />,
  Write: <IconFont type="icon-Write" />,
  Code: <IconFont type="icon-Code" />,
  Others: <IconFont type="icon-Others" />,
  Customize: <IconFont type="icon-Customize" />,
}

const MainFooter = (props) => {
  const { saveContent, loading, form } = props
  const mentionRef = useRef(null) // 输入区实例
  const [state, setState] = useImmer({
    popoverShow: false, // 提示小弹框是否显示
    mentionSelect: false, // 当前是否选中了某条mention
    activeScene: '', // 提示小弹框选中的场景
    activePrompt: {}, // 提示小弹框选中的提示
    content: '', // 输入框信息
    curConProList: [], // 当前内容区用到的提示列表
    popInputValue: '', // 提示小弹框搜索框value
    sendContVariable: [], // 发送内容中的变量列表
    varModalVisible: false, // 变量配置弹框
    promptList: [], // 提示小弹框数据
    popListDesc: "", // hover prompt desc
    allPrompt: [], // 全部提示prompt
    shiftKeyDown: false, // shift快捷键是否被按下(shift + enter = 回车换行)
  })
  // 用户输入内容是否可以发送, 去除输入内容的收尾两端空格
  const disable = useMemo(() => state.content.trim() === '' || loading, [state.content, loading])

  useEffect(() => {
    // 监听键盘上下键滚动提及组件滚动条
    document.querySelector('.ant-mentions')?.addEventListener('keydown', onArrowClick)
    // 监听mentions-select点击事件，赋值mentions选中数据状态
    window.addEventListener('click', onClickFun)
    return () => {
      window.removeEventListener('click', onClickFun)
      document.querySelector('.ant-mentions')?.removeEventListener('keydown', onArrowClick)
    }
  }, [])

  useEffect(() => {
    getPromptGroup().then(res => {
      setState(draft => {
        draft.promptList = res
        draft.activeScene = res[0]?.scene_name || ''
      })
    })
    getPromptAll().then(res => {
      setState(draft => {
        draft.allPrompt = res?.rows?.map(cur => ({ ...cur, label: cur.name, value: cur.prompt, key: cur.id})) || []
      })
    })
  }, [])

  // 切换提示小弹框显示状态
  const onChangePop = e => {
    e && e.stopPropagation()
    if (!state.popoverShow) {
      mentionRef.current.focus()
    }
    setState(draft => {
      draft.popoverShow = !draft.popoverShow
      draft.activeScene = draft.promptList[0]?.scene_name || ''
      draft.popInputValue = ''
      draft.activePrompt = {}
    })
  }

  // 输入框内容保存
  const onChange = value => {
    setState(draft => {
      draft.content = value
    })
  }

  // 回车事件
  const onKeyDown = e => {
    if (e && e.keyCode === 13 && !state.shiftKeyDown) {
      e.preventDefault()
    }
    if (e && e.keyCode === 16) {
      setState(draft => {
        draft.shiftKeyDown = true
      })
    }
  }

  // 回车事件
  const onKeyUp = e => {
    if(e && e.keyCode === 13 && !state.shiftKeyDown) {
      if (state.mentionSelect) {
        setState(draft => {
          draft.mentionSelect = false
        })
      } else if (state.content.trim() !== '') {
        onSendMessage()
      }
    }
    if (e && e.keyCode === 16) {
      setState(draft => {
        draft.shiftKeyDown = false
      })
    }
  }

  // 提示小弹框搜索值变化
  const onChangePopVal = e => {
    setState(draft => {
      draft.popInputValue = e.target.value
    })
  }

  // 发送消息
  const onSendMessage = () => {
    if (state.content.trim() !== '') {
      form.validateFields().then(() => {
        const varArr = parseTempVar(state.content.trim())
        if (varArr.length > 0) {
          setState(draft => {
            draft.varModalVisible = true
            draft.sendContVariable = varArr
          })
        } else {
          saveContent(state.content.trim(), state.content.trim(), state.curConProList, [], () => {
            setState(draft => {
              draft.content = ''
              draft.curConProList = []
            })
          })
        }
      }, () => {
        message.error('Please fill in the model parameters correctly!')
      })
    }
  }

  const onCloseModal = values => {
    setState(draft => {
      draft.varModalVisible = false
    })
    if (values) {
      let variables = [] // ${a} ${a[text]...
      let varValues = [] // 值
      let varNames = [] // name
      let varResult = [state.content.trim()] // 初始字符串数组 ['${a}aaa${a[text]}bbb']
      const varParams = [] // 后端接口请求参数
      state.sendContVariable.forEach(cur => {
        varParams.push({ ...cur, value: cur.type === 'file' ? values[cur.var[0]][0].response.data : values[cur.var[0]] })
        variables = [...variables, ...cur.var]
        varValues = [...varValues, ...Array(cur.var.length).fill(cur.type === 'file' ? values[cur.var[0]][0].name : values[cur.var[0]])]
        varNames = [...varNames, ...Array(cur.var.length).fill(cur.name)]
      })
      variables.forEach(cur => {
        varResult.forEach((item, index) => {
          if (Object.prototype.toString.call(item) === "[object String]") {
            const temp = item.split(cur) // ['', 'aaa${a[text]}bbb']
            const arr = []
            temp.forEach((o, ind) => {
              if (ind !== temp.length - 1) {
                arr.push(o)
                arr.push(
                  <Tooltip title={varNames[variables.findIndex(i => i === cur)]}>
                    <span style={{ color: '#08FF6B' }}>
                      {varValues[variables.findIndex(i => i === cur)]}
                    </span>
                  </Tooltip>
                )
              } else {
                arr.push(o)
              }
            })
            varResult.splice(index, 1, arr)
          }
        })
        varResult = varResult.flat()
      })
      const text = <>{varResult.map(cur => cur)}</>
      saveContent(state.content.trim(), text, state.curConProList, varParams, () => {
        setState(draft => {
          draft.content = ''
          draft.curConProList = []
          draft.sendContVariable = []
        })
      })
    }
  }

  const onClickFun = e => {
    if(e && e.target.className.indexOf && e.target.className.includes('ant-mentions-dropdown-menu-item-active')) {
      setState(draft => {
        draft.mentionSelect = false
      })
    }
    setState(draft => {
      draft.popoverShow = false
      draft.activeScene = draft.promptList[0]?.scene_name || ''
      draft.popInputValue = ''
      draft.activePrompt = {}
    })
  }

  const onArrowClick = (e) => {
    if(e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      setTimeout(() => {
        document.querySelector('.ant-mentions-dropdown-menu-item-active')?.scrollIntoView({ block: 'nearest' })
      }, 0)
    }
  }

  return (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        <div className={styles.footerTextarea}>
          <Mentions
            ref={mentionRef}
            autoSize={{ minRows: 3, maxRows: 10 }}
            split=''
            placement="top"
            placeholder="Input something or use existing prompts. You can input '/' or click 'Prompt' to select existing prompts quickly.&#13;&#10;Use '${variable}' to define variables and '${variable[file]}' to upload a file. Use ${variable:xxxx} to assign default values to variables.&#13;&#10;Use 'Shift+Enter' to add new lines."
            prefix='/'
            disabled={loading}
            value={state.content}
            onClick={() => {
              mentionRef.current.blur()
              setTimeout(() => mentionRef.current.focus(), 0)
              setState(draft => {
                draft.popoverShow = false
              })
            }}
            onChange={onChange}
            onKeyUp={onKeyUp}
            onKeyDown={onKeyDown}
            notFoundContent={<>No prompt</>}
            filterOption={(input, option) => {
              if (option.name.includes(input)) {
                return true
              }
              return false
            }}
            onSearch={() => {
              setState(draft => {
                draft.popoverShow = false
              })
            }}
            onSelect={(option, prefix) => {
              const content = state.content.split(prefix).slice(0, -1).join(prefix)
              let newContent = ''
              if (state.curConProList.length === 0 || option.role_id === state.curConProList[0].role_id) {
                newContent = content + option.prompt
              } else {
                newContent = content + option.role_prompt + option.prompt
              }
              setState(draft => {
                draft.mentionSelect = true
                draft.content = newContent
                draft.curConProList = [ ...draft.curConProList, option ].reduce((o, i) => {
                  if (!o.map(cur => cur.id).includes(i.id)) {
                    o.push(i)
                  }
                  return o
                }, [])
              })
              setTimeout(() => {
                mentionRef.current.textarea.setSelectionRange(newContent.length, newContent.length)
              }, 0)
            }}
            options={state.allPrompt}
          />
        </div>
        <div className={styles.footerBar} />
        <div className={styles.footerOpeater}>
          {loading && <IconFont className={`${styles.opeaterTip} ${styles.opeaterTipDis}`} type="icon-tishi-zhihui" />}
          {!loading && <IconFont className={styles.opeaterTip} type="icon-tishi" onClick={onChangePop} />}
          <div onClick={e => e.stopPropagation()} className={`${styles.footerPopover} ${state.popoverShow ? null : styles.footerPopHide}`}>
            <Input autocomplete='off' size='large' value={state.popInputValue} onChange={onChangePopVal} className={styles.popoverInput} placeholder="Input prompt name" suffix={<IconFont type="icon-sousuo" />} />
            <div className={styles.popoverContent}>
              <div className={styles.popConLeft}>
                {state.promptList.map((cur, ind) => (
                  <div
                    key={`${ind}${cur.scene_name}`}
                    onClick={() => {
                      setState(draft => {
                        draft.activeScene = cur.scene_name
                      })
                    }}
                    className={`${styles.popConLefItem} ${cur.scene_name === state.activeScene ? styles.popConLefActive : null}`}
                  >
                    <span>
                      {iconMap[cur.scene_name] ? iconMap[cur.scene_name] : iconMap.Customize}
                    </span>
                    <Tooltip placement="right" title={cur.scene_name}>
                      <span className={styles.leftItemName}>{cur.scene_name}</span>
                    </Tooltip>
                  </div>
                ))}
              </div>
              <div className={styles.popConRight}>
                <div className={styles.conRightList}>
                  {state.promptList?.find(cur => cur.scene_name === state.activeScene)?.prompt_list.length > 0 && (
                    <List
                      size="small"
                      dataSource={state.promptList.find(cur => cur.scene_name === state.activeScene).prompt_list.filter(cur => cur.name.includes(state.popInputValue)) || []}
                      renderItem={item => (
                        <List.Item
                          onClick={() => {
                            setState(draft => {
                              // draft.activePrompt = item
                              draft.popoverShow = false
                              if (draft.curConProList.length === 0 || item.role_id === draft.curConProList[0].role_id) {
                                draft.content = draft.content + item.prompt
                              } else {
                                draft.content = draft.content + item.role_prompt + item.prompt
                              }
                              draft.curConProList = [ ...draft.curConProList, item ].reduce((o, i) => {
                                if (!o.map(cur => cur.id).includes(item.id)) {
                                  o.push(i)
                                }
                                return o
                              }, [])
                            })
                          }}
                          className={item.id === state.activePrompt.id ? styles.popConRigActive : null}
                          onMouseEnter={() => {
                            setState(draft => {
                              draft.popListDesc = item.prompt
                            })
                          }}
                          onMouseLeave={() => {
                            setState(draft => {
                              draft.popListDesc = state.activePrompt?.prompt || ''
                            })
                          }}
                        >
                          {item.name}
                        </List.Item>
                      )}
                    />
                  )}
                  {state.promptList.find(cur => cur.scene_name === state.activeScene)?.prompt_list.length === 0 && (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </div>
                <div className={styles.conRightDesc}>
                  {state.popListDesc}
                </div>
              </div>
            </div>
            <div className={styles.triangle} />
          </div>
        </div>
      </div>
      <div className={`${styles.footerRight} ${!disable ? styles.footerActive : null}`} onClick={disable ? null : onSendMessage}>
        <IconFont className={styles.opeaterIcon} type="icon-fasong" />
      </div>
      {state.varModalVisible && (
        <VarModal
          varList={state.sendContVariable}
          varOpen={state.varModalVisible}
          closeModal={onCloseModal}
        />
      )}
    </div>
  )
}

export default MainFooter
