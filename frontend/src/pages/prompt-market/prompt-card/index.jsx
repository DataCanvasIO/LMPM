import React from 'react'
import { MoreOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Tag, Typography, Tooltip, Modal } from 'antd'
import { IconFont } from 'components/icon'
import { formatTimeStamp } from 'utils'
import styles from './index.less'

const PromptCard = (props) => {
  const { prompt, onClick, onEdit, onDelete } = props

  return (
    <div className={styles.contentCard} onClick={onClick}>
      {prompt.source === 'user' && (
        <div className={styles.cardCustom}>
          <div onClick={e => e.stopPropagation()}>
            <MoreOutlined className={styles.cardCustomIcon} />
          </div>
          <div className={styles.cardCustomOpeater}>
            <div
              className={styles.cardCustomEdit}
              onClick={e => {
                e.stopPropagation()
                onEdit()
              }}
            >
              Edit
            </div>
            <div
              className={styles.cardCustomDelete}
              onClick={e => {
                e.stopPropagation()
                Modal.confirm({
                  title: 'Are you sure to delete the current prompt?',
                  icon: <ExclamationCircleOutlined />,
                  onOk() {
                    onDelete()
                  }
                })
              }}
            >Delete</div>
          </div>
        </div>
      )}
      <div className={styles.cardName}>
        <Tooltip title={prompt.source === 'system' ? 'System' : 'User'}>
          <span className={`${styles.typeMark} ${prompt.source === 'system' ? styles.systemMark : styles.userMark}`}>
            {prompt.source === 'system' ? 'S' : 'U'}
          </span>
        </Tooltip>
        <Typography.Text ellipsis={{ tooltip: prompt.name || '--' }} style={{ width: 'calc(100% - 30px)' }}>
          <span className={styles.promptName}>{prompt.name || '--'}</span>
        </Typography.Text>
      </div>
      <div className={styles.cardVariable}>
        <span>
          <Tooltip placement="top" title={`Input variables`}>
            <IconFont type="icon-bianliang" className={styles.iconVar} />
          </Tooltip>
          {prompt.variables.length || 0} Variables
        </span>
        <span>
          <Tooltip placement="top" title={`Update time`}>
            <IconFont type="icon-shijian" className={styles.iconDate} />
          </Tooltip>
          {formatTimeStamp(prompt.update_time)}
        </span>
        {/* <span>
          <Tooltip placement="top" title={`Score： 50 分`}>
            <IconFont type="icon-shijian" className={styles.iconDate} />
          </Tooltip>
          <span  className={styles.iconRate} onClick={e => e.stopPropagation()}>
            <Rate allowHalf defaultValue={0} onChange={onRateChange} />
          </span>
        </span> */}
      </div>
      <div className={styles.cardContent}>
        <Typography.Paragraph
          ellipsis={{ rows: 2, tooltip: prompt.prompt || '--' }}
          copyable={{
            icon: [
              <IconFont type="icon-fuzhi" className={styles.iconFont} />,
              <CheckCircleOutlined className={styles.iconFont} />
            ],
            tooltips: ['Copy', 'Copy successful!'],
          }}
        >
          {prompt.prompt || '--'}
        </Typography.Paragraph>
      </div>
      <div className={styles.cardTag}>
        {prompt.scene_name && (
          <Tag>
            {prompt.scene_name}
          </Tag>
        )}
        {prompt.role_name && (
          <Tag>
            {prompt.role_name}
          </Tag>
        )}
        {prompt.labes_name.length > 0 && prompt.labes_name.map((tag, index) => (
          <Tag key={`${tag}${index}`}>
            {tag}
          </Tag>
        ))}
      </div>
    </div>
  )
}

export default PromptCard
