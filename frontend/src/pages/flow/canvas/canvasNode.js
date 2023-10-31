import React from 'react'
import styles from './index.less'
import { IconFont } from 'components/icon'
import { Tooltip, Divider } from 'antd'
import { Typography } from 'antd'
import { CanvasNode } from '../../components/workflow'

const MyCanvasNode = (props) => {
  const { name, moduleName, id, module_type, currNode, copyNode, delNode, publishNode, node, readonly } = props

  const renderIcon = (type) => {
    if (type === 'input') return <IconFont type="icon-input" style={{ fontSize: 16, verticalAlign: 'middle' }}/>
    if (type === 'output') return <IconFont type="icon-output" style={{ fontSize: 20, verticalAlign: 'middle' }}/>
    if (type === 'prompt') return <IconFont type="icon-prompt" style={{ fontSize: 16, verticalAlign: 'middle' }}/>
    if (type === 'script') return <IconFont type="icon-tool" style={{ fontSize: 20, verticalAlign: 'middle' }}/>
    if (type === 'vectordb') return <IconFont type="icon-a-VectorDatabase" style={{ fontSize: 16, verticalAlign: 'middle' }}/>
    return <IconFont type="icon-prompt" style={{ fontSize: 16 }}/>
  }

  const renderMenu = () => {
    const copy = <Tooltip placement="top" title={'copy'}>
      <IconFont type="icon-fuzhi" onClick={() => copyNode(node)} />
    </Tooltip>
    const publish = <Tooltip placement="top" title={'publish'}>
      <IconFont type="icon-publish-2" onClick={() => publishNode(node)} />
    </Tooltip>
    const del = <Tooltip placement="top" title={'delete'}>
      <IconFont type="icon-shanchu" onClick={() => delNode(node)} />
    </Tooltip>
    const divider = <Divider type="vertical" />
    if (['prompt', 'script_prompt'].includes(module_type)) {
      return <div className={styles.nodeMenu}>{[copy, divider, publish, divider, del]}</div>
    } else if (!['input', 'output'].includes(module_type)) {
      return <div className={styles.nodeMenu}>{[del]}</div>
    }
    return null
  }

  return (
    <div className={id === currNode ? `${styles.canvasNode} ${styles.currNode}` : styles.canvasNode} style={{ width: props.width, height: props.height }}>
     <span style={{ marginRight: 8 }}>{renderIcon(module_type)}</span>
      <Typography.Text ellipsis={{ rows: 1, tooltip: name || moduleName }}>{name || moduleName}</Typography.Text>
      {id === currNode && !readonly && renderMenu()}
    </div>
  )
}

export default CanvasNode(MyCanvasNode)
