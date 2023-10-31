import React, { useRef, useEffect } from 'react'
import { MenuUnfoldOutlined, LoadingOutlined } from '@ant-design/icons'
import { Select, message, Modal, Form } from 'antd'
import { copyValue } from 'utils/variable'
import { IconFont } from 'components/icon'
import PublishPrompt from 'components/publish-prompt'
import { useImmer } from 'use-immer'
import DrawerForm from '../main-right'
import MainFooter from '../main-footer'
import ChatItem from '../chat-item'
import { getUuid } from 'utils'
import { getContextList } from '../utils'
import { syncSendMsg } from 'services/chat'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import styles from './index.less'

const ChatMain = (props) => {
  const [form] = Form.useForm() // 右侧模型参数配置区表单
  const contentRef = useRef(null) // 内容区实例
  const talkRef = useRef(null) // 对话区实例
  const drawerRef = useRef(null) // 抽屉区表单实例
  const [state, setState] = useImmer({
    drawerShow: true, // 抽屉展示变量
    selectVal: 'Without-context', // 下拉框选中数据
    talkList: [], // 聊天内容数据
    talkPromptList: [], // 当前对话输入框应用到的prompt列表
    loading: false, // 提问回答loading状态
    publishPrompt: {}, // 发布prompt
    publishVisible: false, // 发布弹框
    contentHeight: 0,
  })

  // 聊天区滚动到底部操作
  useEffect(() => {
    contentRef.current.scrollTo({ top: state.contentHeight, behavior: 'smooth' })
  }, [state.contentHeight])

  // 上下文切换操作
  const onChange = val => {
    setState(draft => {
      draft.selectVal = val
    })
    onClean()
  }

  // 清理操作
  const onClean = () => {
    // 如果有对话信息 && 对话信息最后一条不是分割线
    if (!state.loading && state.talkList.length > 0 && state.talkList[state.talkList.length - 1].type !== 'New') {
      // 内容区dom高度
      const contentHeight = contentRef.current.clientHeight
      // 清理之后对话区应有的高度 = 对话区最后一个节点距父容器顶端距离 + 最后一个节点本身高度 + 一个完整内容区的高度
      const cleanHeight = talkRef.current.lastChild.offsetTop + talkRef.current.lastChild.clientHeight + contentHeight
      // 设置清理之后对话区应有的高度
      talkRef.current.style.height = `${cleanHeight}px`
      setState(draft => {
        draft.talkList = [
          ...draft.talkList.slice(0, -1),
          { ...draft.talkList.slice(-1)[0], regenerate: false },
          { type: 'New', text: 'Here is a new chat. Please view historical chat upwards.' }
        ]
        draft.contentHeight = contentRef.current.scrollHeight
      })
    }
  }

  // 点击清理
  const onClickClean = () => {
    if (state.selectVal === 'In-context') {
      Modal.confirm({
        content: 'After clearing the screen, a new dialogue will be generated without any associated historical dialogue content',
        onOk: () => {
          onClean()
        }
      })
    } else {
      onClean()
    }
  }

  // 切换角色全称显示操作
  const onChangeFullRole = item => {
    setState(draft => {
      draft.talkList = draft.talkList.map(cur => {
        if (cur.id === item.id) {
          return { ...cur, full: !cur.full }
        }
        return cur
      })
    })
  }

  // 添加 regenerate 操作
  const onAddRegenerate = item => {
    form.validateFields().then(() => {
      const newTalkList = [
        ...state.talkList.slice(0, -1),
        { ...item, regenerate: false },
        {
          id: getUuid(),
          type: 'Assistant',
          copy: false,
          text: <LoadingOutlined />,
          context: state.selectVal,
          regenerate: false,
          regenerateNum: item.regenerateNum + 1,
          role: 'assistant',
          error: false,
          ...drawerRef.current.getData(),
        },
      ]
      setState(draft => {
        draft.loading = true
        draft.talkList = newTalkList
        draft.contentHeight = contentRef.current.scrollHeight
      })
      onScrollBottom()
      const drawerData = drawerRef.current.getData()
      const contentList = getContextList(newTalkList, state.selectVal)
      const contentListLast = contentList.filter(cur => Boolean(cur.prompt_variables))
      const streamTalkList = [ ...contentList, contentListLast[contentListLast.length - 1] ]
      const stream = drawerData.model_params.find(cur => cur.name === 'stream')
      if (stream && stream.value && String(stream.value).toLowerCase() === 'true') {
        onStreamFetch(streamTalkList, 'regenerate')
      } else {
        onNotStreamFetch(streamTalkList, 'regenerate')
      }
    }, () => {
      message.error('Please fill in the model parameters correctly!')
    })
  }

  // 删除 regenerate 操作
  const onDeleteRegenerate = item => {
    let counter = 0
    const result = []
    state.talkList.forEach((cur, ind) => {
      const curNextRegenerate = state.talkList[ind + 1] ? (state.talkList[ind + 1].id === item.id && item.regenerate) : false
      if (cur.id === item.id) {
        counter = item.regenerateNum
      } else if (counter && cur.type === 'Assistant') {
        result.push({ ...cur, regenerateNum: counter, regenerate: curNextRegenerate ? true : cur.regenerate })
        counter++
      } else if (counter && cur.type !== 'Assistant') {
        result.push(cur)
        counter = 0
      } else if (curNextRegenerate) {
        result.push({ ...cur, regenerate: true })
      } else {
        result.push(cur)
      }
    })
    setState(draft => {
      draft.talkList = result
    })
  }

  // 内容复制操作
  const onCopyContent = (text, id) => {
    copyValue(text)
    setState(draft => {
      draft.talkList = draft.talkList.map(cur => {
        if (cur.id === id) {
          return { ...cur, copy: true }
        }
        return cur
      })
    })
    setTimeout(() => {
      setState(draft => {
        draft.talkList = draft.talkList.map(cur => {
          if (cur.id === id) {
            return { ...cur, copy: false }
          }
          return cur
        })
      })
    }, 1500)
  }

  // 发布操作
  const onPublishPrompt = prompt => {
    setState(draft => {
      draft.publishPrompt = prompt
      draft.publishVisible = true
    })
  }

  // 请求 error 操作
  const onFetchError = (error, type) => {
    setTimeout(() => {
      setState(draft => {
        draft.loading = false
        if (type === 'sendMessage') {
          draft.talkList = [
            ...draft.talkList.slice(0, -2),
            { ...draft.talkList.slice(-2, -1)[0], error: true },
            { ...draft.talkList.slice(-1)[0], regenerate: true, text: error, error: true }
          ]
        } else {
          draft.talkList = [
            ...draft.talkList.slice(0, -1),
            { ...draft.talkList.slice(-1)[0], regenerate: true, text: error, error: true }
          ]
        }
        draft.contentHeight = contentRef.current.scrollHeight
      })
    })
  }

  // stream 请求操作
  const onStreamFetch = (contentList, type) => {
    let controller = new AbortController()
    const eventSource = fetchEventSource('/api/chat/model/async/completions', {
      method: 'POST',
      headers: {'Content-Type': 'text/event-stream'},
      body: JSON.stringify({ ...drawerRef.current.getData(), prompts: contentList }),
      signal: controller.signal,
      onopen() {
        console.log('open')
      },
      onmessage: async(event) => {
        console.log('onMessage',JSON.parse(event.data))
        const data = JSON.parse(event.data)
        if (event.event === 'message') {
          setTimeout(() => {
            setState(draft => {
              const current = draft.talkList.slice(-1)[0]
              draft.talkList = [
                ...draft.talkList.slice(0, -1),
                {
                  ...current,
                  text: data.role ? '' : `${current.text}${data.content}`,
                  role: data.role || 'assistant'
                }
              ]
              draft.contentHeight = contentRef.current.scrollHeight
            })
          }, 0)
        } else if (event.event === 'error') {
          onFetchError(data.content, type)
        }
      },
      onclose(close) {
        console.log('onclose', close)
        setTimeout(() => {
          setState(draft => {
            draft.loading = false
            draft.talkList = [
              ...draft.talkList.slice(0, -1),
              { ...draft.talkList.slice(-1)[0], regenerate: true }
            ]
          })
        }, 0)
        onScrollBottom()
        controller.abort() //出错后不要重试
        eventSource.close()
      },
      onerror(error) {
        console.log('onerror', error)
        onFetchError('Parsing failed. Please try again later', type)
        onScrollBottom()
        controller.abort() //出错后不要重试
        eventSource.close()
      }
    })
  }

  // 非 stream 请求操作
  const onNotStreamFetch = (contentList, type) => {
    syncSendMsg({ prompts: contentList, ...drawerRef.current.getData() }).then(res => {
      setState(draft => {
        draft.loading = false
        const resContent = Object.prototype.toString.call(res.content) === "[object String]" ? res.content : JSON.stringify(res.content)
        if (res.status === 'fail' && type !== 'regenerate') {
          draft.talkList = [
            ...draft.talkList.slice(0, -2),
            { ...draft.talkList.slice(-2, -1)[0], error: true },
            { ...draft.talkList.slice(-1)[0], regenerate: true, text: resContent, error: true }
          ]
        } else if (res.status === 'fail' && type === 'regenerate') {
          draft.talkList = [
            ...draft.talkList.slice(0, -1),
            { ...draft.talkList.slice(-1)[0], regenerate: true, text: resContent, error: true }
          ]
        } else {
          draft.talkList = [
            ...draft.talkList.slice(0, -1),
            { ...draft.talkList.slice(-1)[0], regenerate: true, text: resContent, role: res.role }
          ]
        }
        draft.contentHeight = contentRef.current.scrollHeight
      })
    }).catch(() => {
      onFetchError('Parsing failed. Please try again later', type)
    })
  }

  /**
   * 发送信息操作
   * @param originContent 原始文字
   * @param contentVal 带标签的转换文字
   * @param promptList 输入框中选中过的prompt
   * @param variables 输入框中的变量列表(var/name/type/defaultValue/value)
   * @param callback 回调清空输入框中内容及选中过的prompt
   */
  const onSendContent = (originContent, contentVal, promptList, variables, callback) => {
    callback()
    let oldTalkList = state.talkList
    if (state.talkList.slice(-1)[0]?.type === 'Assistant') {
      oldTalkList = [
        ...state.talkList.slice(0, -1),
        { ...state.talkList.slice(-1)[0], regenerate: false },
      ]
    }
    const newTalkList = [
      ...oldTalkList,
      {
        id: getUuid(),
        type: 'User',
        origin: originContent,
        text: contentVal,
        promptList,
        context: state.selectVal,
        variables,
        full: false,
        copy: false,
        error: false,
      },
      {
        id: getUuid(),
        type: 'Assistant',
        text: <LoadingOutlined />,
        context: state.selectVal,
        regenerate: false,
        copy: false,
        regenerateNum: 1,
        role: 'assistant',
        error: false,
        ...drawerRef.current.getData(),
      },
    ]
    setState(draft => {
      draft.loading = true
      draft.talkList = newTalkList
    })
    onScrollBottom()
    const drawerData = drawerRef.current.getData()
    const contentList = getContextList(newTalkList, state.selectVal)
    if (drawerData.model_params.find(cur => cur.name === 'stream') && String(drawerData.model_params.find(cur => cur.name === 'stream').value).toLowerCase() === 'true') {
      onStreamFetch(contentList, 'sendMessage')
    } else {
      onNotStreamFetch(contentList, 'sendMessage')
    }
  }

  // 聊天区滚动到底部操作
  const onScrollBottom = () => {
    setTimeout(() => {
      contentRef.current.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' })
    }, 0)
  }

  return (
    <div className={styles.main}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <IconFont className={styles.titleIcon} type="icon-chat" />
          <div className={styles.titleText}>Chat</div>
          <Select
            className={styles.talkSelect}
            value={state.selectVal}
            style={{ width: 272 }}
            onChange={onChange}
            disabled={state.loading}
            getPopupContainer={triggerNode => triggerNode.parentElement}
            options={[
              { value: 'Without-context', label: 'Without-context' },
              { value: 'In-context', label: 'In-context' },
            ]}
          />
          <div className={`${styles.cleanBox} ${!state.loading && state.talkList.length > 0 && state.talkList[state.talkList.length - 1].type !== 'New' ? styles.cleanBoxActive : null}`}>
            <IconFont className={styles.cleanIcon} type="icon-qingchu" onClick={onClickClean} />
          </div>
        </div>
        <div className={styles.talk}>
          <div className={styles.content} ref={contentRef}>
            <div ref={talkRef}>
              {state.talkList.map((ite, ind) => (
                <ChatItem
                  ite={ite}
                  ind={ind}
                  onChangeFullRole={onChangeFullRole}
                  onCopyContent={onCopyContent}
                  onPublishPrompt={onPublishPrompt}
                  onDeleteRegenerate={onDeleteRegenerate}
                  onAddRegenerate={onAddRegenerate}
                />
              ))}
            </div>
          </div>
          <MainFooter loading={state.loading} saveContent={onSendContent} form={form} />
        </div>
      </div>
      <div className={`${styles.drawer} ${state.drawerShow ? null : styles.drawerHiddle}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Configuration</span>
          <span
            className={styles.foldIcon}
            onClick={() => {
              setState(draft => {
                draft.drawerShow = !draft.drawerShow
              })
            }}
          >
            <MenuUnfoldOutlined className={`${styles.iconRot} ${!state.drawerShow ? styles.iconRot180 : null}`} />
          </span>
        </div>
        <div className={styles.drawerContent}>
          <DrawerForm form={form} ref={drawerRef} />
        </div>
      </div>
      {state.publishVisible && (
        <PublishPrompt
          prompt={{
            prompt: state.publishPrompt.origin || '',
            role_id: state.publishPrompt?.promptList[0]?.role_id || '',
            pro_id:  state.publishPrompt?.promptList[0]?.id || '',
          }}
          handleModalVisible={() => {
            setState(draft => {
              draft.publishVisible = false
              draft.publishPrompt = {}
            })
          }}
          visible={state.publishVisible}
        />
      )}
    </div>
  )
}

export default ChatMain
