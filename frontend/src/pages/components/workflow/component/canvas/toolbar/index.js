import React, { FC, useEffect, useRef, useState } from 'react'
import { Divider, Tooltip, Switch } from 'antd'
import classNames from 'classnames'
import { MinusCircleOutlined , PlusCircleOutlined } from '@ant-design/icons'
import { IconFont } from 'components/icon'
import { triggerCanvasOperation } from '../../../utils/util'
import '../canvas.less'

const CanvasTollBar = ({ className, isAbsolute, readonly, zoom, restoreView, autoLayout, fullScreen, resourceVisible, resource, customerToolBar, workflowId, onZoom, zoomScale, fittoScreen, addComment, changeCommentVisible, changeResourceVisible, autoLayoutByLevel }) => {
  const autoLayoutRef = useRef(true)
  // const [toolbar, setToolbar] = useImmer({
  //   commentVisible: false,
  //   resourceVisible: false,
  // })
  const [arrowsD, setArrowsD] = useState(true)

  const switchNote = (n) => {
    changeCommentVisible(n)
    // setToolbar((draft) => {
    //   draft.commentVisible = n
    // })
    triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.SwitchComment, {commentsVisible: n})
  }

  const switchResource = (n) => {
    // setToolbar((draft) => {
    //   draft.resourceVisible = n
    // })
    changeResourceVisible(n)
    triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.SwitchResource, {resourceVisible: n})
  }

  const handleNavigator = () => {
    // minMap.onClick && minMap.onClick()
    // changeMinMapVisible()
  }

  const handleAutoLayout = () => {
    if (autoLayoutRef.current) {
      autoLayoutRef.current = false
      // @ts-ignore
      autoLayoutByLevel()
      setTimeout(() => {
        autoLayoutRef.current = true
      }, 3000)
    }
  }

  const toolbarOnMouseDown = (e) => {
    e.stopPropagation()
  }

  const classNameStr = classNames('pm-canvas-toolbar', className)

  // useEffect(() => {
  //   const storageData = localStorage.getItem(`workflow-status-${workflowId}`)
  //   if (storageData) {
  //     const initStorageData = JSON.parse(storageData)
  //     setToolbar((draft) => {
  //       draft.commentVisible = initStorageData.commentVisible
  //       draft.resourceVisible = initStorageData.resourceVisible
  //     })
  //   }
  // }, [])

  useEffect(() => {
    // resource.onClick && resource.onClick(resourceVisible)
  }, [resourceVisible])

  return (
    <div className={`${classNameStr} ${isAbsolute ? 'isAbsolute' : ''} `} onMouseDown={toolbarOnMouseDown}>
      {customerToolBar.render()}
       <>
          {/* {
            fullScreen.show && <>
              <Divider type="vertical" />
              {arrowsD && <Tooltip placement='top' title='全屏'> <Icon type="zeticon-arrows-alt" style={{ cursor: 'pointer' }} onClick={() => {setArrowsD(!arrowsD) fullScreen.onClick()}}/></Tooltip> }
              {!arrowsD && <Tooltip placement='top' title='缩小' ><Icon type="zeticon-shrink" style={{ cursor: 'pointer' }} onClick={() => {setArrowsD(!arrowsD) fullScreen.onClick()}}/></Tooltip> }
            </>
          } */}
            <div className="zoom">
              <IconFont type="icon-suoxiao" style={{ cursor: 'pointer', color: '#9366d4' }} onClick={() => onZoom(false)}/>
              <span style={{ userSelect: 'none', color: 'rgba(15,15,15,0.5)',  display: 'inline-block', width: 59, textAlign: 'center' }}>{`${parseInt(zoomScale * 100)}%`}</span>
              <IconFont type="icon-fangda" style={{ cursor: 'pointer', color: '#9366d4', }} onClick={() => onZoom(true)}/>
          </div>
          {restoreView.show && <>
            <Divider type="vertical" />
            <Tooltip placement="top" title={'Restore View'}>
              <span style={{ cursor: 'pointer' }} onClick={fittoScreen}>
                <IconFont type="icon-fit-to-screen"  style={{color: 'rgba(15,15,15,0.5)'}} />
              </span>
            </Tooltip>
          </>}
          {autoLayout.show && <>
            <Divider type="vertical" />
            <Tooltip placement="top" title={'Auto Layout'}>
              <span style={ readonly ? { cursor: 'no-drop' } : { cursor: 'pointer' }} onClick={readonly ? null : handleAutoLayout}>
                <IconFont type="icon-zidongbuju" style={{color: 'rgba(15,15,15,0.5)'}}/>
              </span>
            </Tooltip>
          </>}
          {/* {zoom.show && <>
            <Divider type="vertical" /><div>
              <Icon type="minus-circle-o" style={{ cursor: 'pointer' }} onClick={() => onZoom(false)}/>
              <span style={{ userSelect: 'none', display: 'inline-block', width: 59, textAlign: 'center' }}>{`${parseInt(zoomScale * 100)}%`}</span>
              <Icon type="plus-circle-o" style={{ cursor: 'pointer' }} onClick={() => onZoom(true)}/>
            </div></>}
          {minMap.show && <><Divider type="vertical" />
            <Tooltip placement="top" title={locale.toolbar?.navigator || '导航器'}>
              <Icon onClick={handleNavigator} type="compass" style={{ cursor: 'pointer' }} />
            </Tooltip>
          </>} */}
        </>
    </div>
  )
}

CanvasTollBar.defaultProps = {
  // minMap: {
  //   show: true,
  //   onClick: () => { },
  // },
  zoom: {
    show: true,
    onClick: () => { },
  },
  restoreView: {
    show: true,
    onClick: () => { },
  },
  fullScreen: {
    show: true,
    onClick: () => { },
  },
  // comment: {
  //   show: true,
  //   onClick: () => { },
  // },
  // commentSwitch: {
  //   show: true,
  //   onClick: () => { },
  // },
  // resource: {
  //   show: true,
  //   onClick: () => { },
  // },
  customerToolBar: {
    render: () => (<></>)
  },
  autoLayout: {
    show: false,
    onClick: () => { },
  },
  onZoom: (operation) => {},
  zoomScale: 1,
  fittoScreen: () => {},
  changeCommentVisible: () => {},
  isAbsolute: false,
  canvasMapConfig: {
    styleConfig: () => { },
  }
}

export default CanvasTollBar
