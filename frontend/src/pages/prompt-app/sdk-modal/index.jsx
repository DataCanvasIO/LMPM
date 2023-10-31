import React, { useEffect, memo } from 'react'
import { useImmer } from 'use-immer'
import { Modal, Tabs, Empty } from 'antd'
import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { gruvboxLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { getSDK, exportSDK } from '@/services/promptApp'
import styles from './index.less'

const SdkModal = (props) => {
  const { sdkOpen, closeModal, id, name } = props
  const [state, setState] = useImmer({
    sdkList: [],
    sdkActive: 'python',
  })

  useEffect(() => {
    getSDK(id).then(res => {
      if(res) {
        setState(draft => {
          draft.sdkList = [
            {
              id: 'python',
              name: 'Python SDK',
              value: res
            },
          ]
        })
      }
    })
  }, [])

  const onChange = (key) => {
    setState(draft => {
      draft.sdkActive = key
    })
  }

  const onOk = () => {
    exportSDK({ id }).then(res => {
      closeModal()
      // data为blob格式
      var blob = new Blob([res], { type: 'application/zip' })
      var downloadElement = document.createElement('a')
      var href = window.URL.createObjectURL(blob)
      downloadElement.href = href
      downloadElement.download = `${name}_sdk`
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement)
      window.URL.revokeObjectURL(href)
    })
  }

  return (
    <Modal
      key='sdk'
      title='SDK'
      open={sdkOpen}
      onCancel={closeModal}
      onOk={onOk}
      maskClosable={false}
      destroyOnClose
      width={960}
      bodyStyle={{ paddingTop: '0px' }}
      cancelText="Cancel"
      okText="Export"
    >
      <div className={styles.sdkMain}>
        {state.sdkList.length === 0 && <Empty className={styles.empty} />}
        {state.sdkList.length > 0 && (
          <Tabs defaultActiveKey={state.sdkActive} onChange={onChange}>
            {state.sdkList.map(cur => (
              <Tabs.TabPane tab={cur.name} key={cur.id}>
                <ReactMarkdown
                  children={cur.value}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline ? (
                        <SyntaxHighlighter
                          {...props}
                          children={String(children).replace(/\n$/, '')}
                          style={gruvboxLight}
                          language={match ? match[1] : 'python'} // 匹配代码语言，默认给shell
                          PreTag="div"
                        />
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      )
                    }
                  }}
                />
              </Tabs.TabPane>
            ))}
          </Tabs>
        )}
      </div>
    </Modal>
  )
}

export default memo(SdkModal)
