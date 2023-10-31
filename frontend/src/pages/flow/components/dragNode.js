import React, { useEffect, useRef, useState } from 'react'
import { Typography, Tooltip } from 'antd'
import { DragNode } from '../../components/workflow'
import { IconFont } from 'components/icon'
import styles from './index.less'

const DragItem = (props) => {
  const { text, data, dragData} = props
  const renderTitle = () => {
    return <div>
      <div>{data.name}</div>
      <div>Prompt:</div> 
      <div className={styles.tooltipText}>{data.prompt}</div>
      <div>Role:</div>
      <div className={styles.tooltipText}>{data.role_name}</div>
    </div>
  }
  return (
    <Tooltip title={data.type === 'prompt' ? renderTitle() : null} placement="right" overlayStyle={{ width: 250 }}>
      <div className={`${styles.dragNode} ${dragData.readonly ? styles.readonly : ''}`}>
        <Typography.Text ellipsis={{rows: 1}}>{text}</Typography.Text>
        <IconFont type="icon-tuodong" className={styles.dragIcon} />
      </div>
    </Tooltip>

  )
}

const getNodeCanDrag = (data) => {
  return !data.readonly
}

export default DragNode(DragItem, { canDrag: getNodeCanDrag })
