import React, { FC, memo } from 'react'
import classNames from 'classnames'
import { useDrag, DragSourceMonitor } from 'react-dnd'
import './dragNode.less'

const WrapperNode = (Component, params) => {
  const DragNode = memo((props) => {
    const {style, className, dragData} = props
    const classNameStr = classNames(className)
    const [{ isDragging }, drag] = useDrag({
      item: { ...dragData, nodeType: dragData.type, type: 'node', },
      // end: (item: { name: string } | undefined, monitor: DragSourceMonitor) => {
      //   const dropResult = monitor.getDropResult()
      //   if (item && dropResult) {
      //     // alert(`You dropped ${item.name} into ${dropResult.name}!`)
      //   }
      // },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })
    let canDrag = true
    if (params && params.canDrag && params.canDrag(dragData) === false) {
      canDrag = false
    }
    return (
      <div ref={canDrag ? drag : null} style={style} className={classNameStr}>
        <Component {...props}/>
      </div>
    )
  })

  DragNode.defaultProps = {
    dragData: {},
  }

  return DragNode
}

export default WrapperNode
