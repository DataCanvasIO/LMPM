import React, { FC, useEffect, useRef, memo } from 'react'
import WorkFLowToolkit from '../../utils/workFLowToolkit'
import CanvasContextWrapper from './canvasContextWrapper'
import { Dropdown, Menu, Divider } from 'antd'
import classNames from 'classnames'
import './canvas.less'

const MyDivider = () => <Divider style={{margin: 0}} />

const WrapperNode = (Component) => {
  const Node = memo(({ children, onClick, contextMenuList, nodeHeight, nodeWidth, style, className, container, startDrag, onVisibleChange, ...otherProps }) => {
    const { left, top, io, id } = otherProps
    const classNameStr = classNames('pm-canvas-node', className)
    const currStartDrag = useRef(null)
    // currStartDrag.current = startDrag
    useEffect(() => {
      let instance = WorkFLowToolkit.getJsPlumbInstance(container)
      const { inputs, outputs } = io || { inputs: [], outputs: [] }
      instance.nodeInit(id, inputs, outputs, currStartDrag.current)
      return () => {}
    }, [])
    const handleWheelChange = (e) => {
      e.stopPropagation()
    }

    // const getNodesMenu = () => {
    //   return (
    //     <Menu>
    //       {contextMenuList.map(({ type, name, onClick, subMenus }) => {
    //         if (type === 'menu') {
    //           if (subMenus && subMenus.length > 0) {
    //             return (
    //               <Menu.SubMenu popupClassName='subMenuCustom' title={name} onWheel={handleWheelChange}>
    //                 {subMenus.map(item => {
    //                   return (
    //                     <Menu.Item key={item.id} onClick={() => onClick(otherProps, item)}>
    //                       {item.name}
    //                     </Menu.Item>
    //                   )
    //                 })}
    //               </Menu.SubMenu>
    //             )
    //           }
    //           return <Menu.Item key={name} onClick={() => onClick(otherProps)}>{name}</Menu.Item>
    //         }
    //         return <MyDivider key={name} />
    //       })}
    //     </Menu>
    //   )
    // }

    // const  currVisibleChange = (visible) => {
    //   onVisibleChange && onVisibleChange(visible, otherProps)
    // }

    return (
      // <Dropdown overlay={getNodesMenu} trigger={['contextMenu']} onOpenChange={currVisibleChange}>
        <div
          id={id}
          className={classNameStr}
          style={{ left, top, width: nodeWidth, height: nodeHeight, ...style }}
          onClick={(e) => { 
            e.stopPropagation() 
            e.nativeEvent.stopImmediatePropagation() 
            onClick(otherProps) 
          }}
        >
          <Component {...otherProps} />
        </div>
      // </Dropdown>
    )
  })

  Node.defaultProps = {
    contextMenuList: [],
    onClick: () => { },
    startDrag: () => {return true},
  }

  return CanvasContextWrapper(Node)
}

export default WrapperNode
