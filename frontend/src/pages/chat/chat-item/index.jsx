import React from 'react'
import { CheckCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { IconFont } from 'components/icon'
import styles from './index.less'

const ChatItem = props => {
  const { ite, ind, onChangeFullRole, onCopyContent, onPublishPrompt, onDeleteRegenerate, onAddRegenerate } = props

  return (
    <>
      {ite.type === 'User' && (
        <div key={`${ite.type}${ind}`} className={`${styles.talkItem} ${styles.userItem}`}>
          <div className={`${styles.itemInfo} ${styles.userInfo}`}>
            <div className={styles.itemLeft}>
              {ite.promptList[0] && (
                <div className={styles.leftOpeater}>
                  <div className={styles.operBox}>
                    <span className={styles.operText} onClick={() => onChangeFullRole(ite)}>
                      {ite.full ? 'Hide Role' : 'Full Text'}
                    </span>
                    {!ite.full && <span className={styles.operRole}>{ite.promptList[0].role_name}</span>}
                  </div>
                </div>
              )}
              <div className={`${styles.leftText} ${ite.context === 'In-context' ? styles.leftTextContext : null}`}>
                <span className={styles.leftCopy}>
                  {ite.copy && <CheckCircleOutlined />}
                  {!ite.copy && <IconFont type="icon-fuzhi" onClick={() => onCopyContent(ite.full ? `${ite.promptList[0]?.role_prompt || ''}${ite.origin}` : ite.origin, ite.id)} />}
                </span>
                {ite.context === 'In-context' && (
                  <span className={styles.leftContext}>
                    <IconFont type="icon-lianjie1" />
                  </span>
                )}
                <div className={styles.leftTriangle} />
                <div className={styles.leftTriangle1} />
                <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {ite.full ? <><>{ite.promptList[0].role_name === 'None' ? '' : (ite.promptList[0].role_prompt || '')} </>{ite.text}</> : <>{ite.text}</>}
                </span>
              </div>
              <div className={styles.leftPublish}>
                <span className={styles.publishText} onClick={() => onPublishPrompt(ite)}>Publish Prompt</span>
              </div>
            </div>
            <div className={styles.itemRight}>
              <IconFont className={styles.rightIcon} type="icon-user" />
              {/* <div className={styles.refine}>Refine</div> */}
            </div>
          </div>
        </div>
      )}
      {ite.type === 'Assistant' && (
        <div key={`${ite.type}${ind}`} className={`${styles.talkItem} ${styles.assistantItem}`}>
          <div className={`${styles.itemInfo} ${styles.assistantInfo}`}>
            <div className={`${styles.itemLeft} ${ite.regenerateNum === 1 ? styles.itemLeftIcon : styles.itemLeftNum}`}>
              {ite.regenerateNum === 1 && <IconFont type="icon-modeler" />}
              {ite.regenerateNum !== 1 && <span>{ite.regenerateNum}</span>}
            </div>
            <div className={styles.itemRight}>
              <div className={styles.rightOpeater}>
                <span className={styles.operModel}>{ite.model_name}</span>
              </div>
              <div className={`${styles.rightText} ${ite.context === 'In-context' ? styles.rightTextContext : null}`}>
                {Object.prototype.toString.call(ite.text) === "[object String]" && (
                  <span className={styles.rightCopy}>
                    {ite.copy && <CheckCircleOutlined />}
                    {!ite.copy && <IconFont type="icon-fuzhi" onClick={() => onCopyContent(ite.text, ite.id)} />}
                  </span>
                )}
                {Object.prototype.toString.call(ite.text) === "[object String]" && ite.regenerateNum !== 1 && (
                  <span className={styles.rightDelete} onClick={() => onDeleteRegenerate(ite)}>
                    <IconFont type="icon-shanchu" />
                  </span>
                )}
                {ite.context === 'In-context' && (
                  <span className={styles.rightContext}>
                    <IconFont type="icon-lianjie1" />
                  </span>
                )}
                <div className={styles.rightTriangle} />
                <div className={styles.rightTriangle1} />
                <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} className={ite.error ? styles.error : null}>
                  {Object.prototype.toString.call(ite.text) === "[object String]" ? <span dangerouslySetInnerHTML={{ __html: ite.text }} /> : <>{ite.text}</>}
                </span>
              </div>
              {(ite.regenerateNum < 100 && ite.regenerate && !ite.error) && (
                <div className={styles.rightRegenerate}>
                  <span className={styles.regenerateText} onClick={() => onAddRegenerate(ite)}>
                    Regenerate
                  </span>
                </div>
              )}
              {(ite.regenerateNum >= 100 && ite.regenerate && !ite.error) && (
                <div className={styles.rightRegenerate}>
                  <Tooltip title="A maximum of 99 regenerations are supported">
                    <span className={styles.regenerateDis}>
                      Regenerate
                    </span>
                  </Tooltip>
                </div>
              )}
              {ite.error && (
                <div className={styles.rightRegenerate}>
                  <Tooltip title={ite.text}>
                    <span className={styles.regenerateDis}>
                      Regenerate
                    </span>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {ite.type !== 'User' && ite.type !== 'Assistant' && (
        <div key={`${ite.type}${ind}`} className={styles.talkDrawer}>
          <div className={styles.drawerBar} />
          <span className={styles.drawerText}>{ite.text}</span>
        </div>
      )}
    </>
  )
}

export default ChatItem
