import React, { FC, useRef, useEffect, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import WorkFLowToolkit from '../../utils/workFLowToolkit'
import PubSub from 'pubsub-js'
import CanvasContext from '../../context/canvasContext'
import CanvasEnum from '../../enum/CanvasEnum'
import CanvasOperationEnum from '../../enum/CanvasOperationEnum'
import DefaultCanvasNode from './defaultCanvasNode'
import classNames from 'classnames'
import CanvasToolbar from './toolbar'
import MinMapEnum from '../../enum/MinMapEnum'
import { DndProvider, useDrop } from 'react-dnd'
import CanvasContainer from './canvasContainer'
import { UUID } from '../../../../../utils'
import { useImmer } from 'use-immer'
import MinMap from './toolbar/minMap'
import MiniMapTool from './toolbar/miniMapTool'
import { triggerCanvasOperation } from '../../utils/util'
import { setConstantValue } from 'typescript'
import './canvas.less'

let initStorageData = {
  inlinecanvasParams: {
    left: 200,
    top: 200,
    scale: 1
  },
  // commentVisible: false,
  // minMapDisplay: true,
  // resourceVisible: false
}

const Canvas = forwardRef(({ workflowId, className, initNodeList, initEdgeList, nodeHeight, nodeWidth, onAddNode, renderNode, renderMiniNode, toolbar, getNodeData, onChange, onClick, startDrag, readonly, ...otherProps }, ref) => {
  const containerRef = useRef(null)
  const canvasWrapperRef = useRef(null)
  const instanceRef = useRef(null)
  const layerRef = useRef(null)
  const [canvasStyle, setCanvasStyle] = useState({
    left: 200,
    top: 200,
  })
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'node',
    drop: async (dratDataProps, monitor) => {
      const endXY = monitor.getClientOffset()
      const nodeClientX = endXY.x
      const nodeClientY = endXY.y
      const nodeData = await getNodeData(dratDataProps)
      delete nodeData?.id
      delete nodeData?.top
      delete nodeData?.left
      const addNodeData = {
        nodeClientX, nodeClientY,
        ...nodeData
      }
      PubSub.publish(CanvasEnum.Add, addNodeData)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const [zoomData, setZoomData] = useImmer({
    deltaY: 0,
    containerScale: 1,
    scaleChangeTime: new Date(),
  })

  const [canvasContextData, setCanvasContextData] = useImmer({
    container: null,
  })  

  const [scaleOrigin, setScaleOrigin] = useImmer({
    x: 0,
    y: 0
  })

  const [canvasData, setCanvasData] = useImmer({
    containerElement: null,
    nodes: initNodeList,
    minMapDisplay: true,
    resourceVisible: false,
    minLeft: 0,
    minTop: 0,
    isRenderCanvasMap: false,
  })  

  function handleDefaultStorageData(jsPlumbInstance) {
    const storageData = localStorage.getItem(`workflow-status-${workflowId}`)
    if (storageData) {
      const initStorageData = JSON.parse(storageData)
      const { left, top, scale } = initStorageData?.inlinecanvasParams
      if (containerRef.current) {
        containerRef.current.style.left = `${left}px`
        containerRef.current.style.top = `${top}px`
        containerRef.current.style.transform = `scale(${scale})`
      }
      jsPlumbInstance.setCanvasParams({
        left,
        top,
        scale,
      })
      setZoomData(draft => {
        draft.containerScale = initStorageData.inlinecanvasParams.scale
      })
      setCanvasData(draft => {
        draft.minMapDisplay = initStorageData.minMapDisplay
        // draft.commentVisible = initStorageData.commentVisible
        // draft.resourceVisible = initStorageData.resourceVisible
      })
    } else {
      setTimeout(() => {
        PubSub.publish(MinMapEnum.MoveCenter)
      }, 0)
    }

    // find node min location
    initNodeList.forEach((item) => {
      if (item.left < canvasData.minLeft) {
        setCanvasData(draft => {
         draft.minLeft = item.left
        })
      }
      if (item.top < canvasData.minTop) {
        setCanvasData(draft => {
          draft.minTop = item.top
         })
      }
    })
  }

  useEffect(() => {
    setCanvasData((draft) => {
      draft.containerElement = containerRef.current
    })
    setCanvasContextData((draft) => {
      draft.container = containerRef.current
    })
  }, [containerRef.current])

  useEffect(() => {
    instanceRef.current?.changeReadonly(readonly)
  }, [readonly])

  useEffect(() => {
    if (canvasWrapperRef.current) {
      setScaleOrigin((draft) => {
        draft.x = computContainerOrigin().x
        draft.y = computContainerOrigin().y
      })
    }

  }, [canvasWrapperRef.current])

  useEffect(() => {
    scribeCanvasOperation()
    instanceRef.current = WorkFLowToolkit.createJsPlumbInstance(containerRef.current, readonly)
    const currNodes = JSON.parse(JSON.stringify(initNodeList))
    const newNodes = instanceRef.current.autoLayout(currNodes, containerRef.current)
    setNodes(newNodes)
    handleDefaultStorageData(instanceRef.current)
    return () => {
      PubSub.unsubscribe(CanvasEnum.Operation)
      WorkFLowToolkit.removeJsPlumbInstance(containerRef.current)
    }
  }, [JSON.stringify(initNodeList)])

  useEffect(() => {
    // console.log(canvasData)
  }, [JSON.stringify(initNodeList)])

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.canvasOperation = canvasOperation()
    }
    // auto Layout
    scribe()
    return () => {
      PubSub.unsubscribe(CanvasEnum.Add)
    }
  }, [canvasData.nodes])

  useEffect(() => {
    setTimeout(() => {
      instanceRef.current?.setConnections(initEdgeList)
    }, 0)
   
  }, [JSON.stringify(initEdgeList), instanceRef.current])

  function scribe() {
    PubSub.subscribeOnce(CanvasEnum.Add, (msg, { nodeClientX, nodeClientY, ...otherProps }) => {
      addNode(nodeClientX, nodeClientY, otherProps)
    })
  }

  function scribeCanvasOperation() {
    PubSub.subscribe(CanvasEnum.Operation, (msg, { type, data }) => {
      handleCanvasChange(type, data)
    })
  }

  const setDeltaY = (val) => {
    setZoomData((draft) => {
      draft.deltaY = val
    })
  }

  const setContainerScale = (val) => {
    setZoomData((draft) => {
      draft.containerScale = val
    })
  }

  const setScaleChangeTime = (val) => {
    setZoomData((draft) => {
      draft.scaleChangeTime = val
    })
  }

  const changeNodeEndPoints = (id, inputs, outputs) => {
    instanceRef.current.
    instanceRef.current?.addEndPoints(id, inputs, outputs)
  }

  useImperativeHandle(ref, () => canvasOperation(), [canvasData.nodes])

  function canvasOperation() {
    return {
      getSaveData: getSaveData,
      changeNode: changeNode,
      changeNodeVersion: changeNodeVersion,
      copyNode: copyNode,
      deleteNode: deleteNode,
      setNodes: setNodes,
      getNodes: getNodes,
      setNodeById: setNodeById,
      getNodeById: getNodeById,
      resetCanvas: resetCanvas,
      changeNodeEndPoints: changeNodeEndPoints,
      getInitCenterPosition: getInitCenterPosition
      // miniMapRender: instanceRef.current?.minMapRender
    }
  }

  function resetCanvas(nodes, connections) {
    instanceRef.current?.resetCanvas()
    setNodes([])
    setTimeout(() => {
      const currNodes = JSON.parse(JSON.stringify(nodes))
      const newNodes = instanceRef.current?.autoLayout(currNodes, containerRef.current)
      setNodes(newNodes)
      // set connections
      setTimeout(() => {
        instanceRef.current?.setConnections(connections)
      }, 0)
    })
  }

  function autoLayoutByLevel() {
    let nodeList = canvasData.nodes
    const connections = getGConnections()
    const currNodes = JSON.parse(JSON.stringify(nodeList))
    const currEdges = JSON.parse(JSON.stringify(connections))
    const newLocations = instanceRef.current?.getLocationsLevel(currNodes, currEdges)
    resetCanvas(newLocations, connections)
    setTimeout(() => {
      triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.AddConnection, {})
    }, 200)
  }

  function changeNode(nodeData) {
    return setSingleNodes(nodeData)
  }

  function changeNodeVersion(oldNodeData, newNodeData) {
    instanceRef.current?.changeNodeVersion(newNodeData.id, oldNodeData.io, newNodeData.io)
    changeNode(newNodeData) 
  }

  function copyNode(nodeData) {
    const { left, top } = document.getElementById(nodeData.id)?.style
    const newLeft = parseFloat(left) + 100
    const newTop = parseFloat(top) + 100
    const node = {
      ...nodeData,
      top: newTop,
      left: newLeft,
      id: UUID(),
      mid: null,
    }
    setNodes([...canvasData.nodes, node])
    triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.CopyNode, {})
  }

  function deleteNode(nodeData) {
    const edges = getSaveData().connections
    const deleteIndex = canvasData.nodes.findIndex((f) => f.id === nodeData.id)
    const newItem = canvasData.nodes[deleteIndex]
    setCanvasData(draft => {
      instanceRef.current?.emptyNode(newItem.id, newItem?.io?.inputs, newItem?.io?.outputs)
      draft.nodes.splice(deleteIndex, 1)
    })
    triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.RemoveNode, {node: newItem, edges})
  }

  function setNodes(nodes) {
    setCanvasData(draft => {
      draft.nodes = nodes
    })
  }

  function setNodeById(id, nodeData) {
    const currNode = getNodeById(id)
    if (!currNode) {
      return
    }
    setSingleNodes({ ...currNode, ...nodeData })
  }

  function getNodeById(id) {
    return canvasData.nodes.find((f) => f.id === id)
  }

  function getNodes() {
    return canvasData.nodes
  }

  const setSingleNodes = (node) => {
    let newNode = null
    setCanvasData(draft => {
      let currNodeIndex = draft.nodes.findIndex((f) => f.id === node.id)
      newNode = { ...draft.nodes[currNodeIndex], ...node}
      draft.nodes.splice(currNodeIndex, 1, newNode)
    })
    return newNode
  }

  function addNode(nodeClientX, nodeClientY, nodeData) {
    const { scale } = instanceRef.current?.getCanvasParams()
    const canvasElement = containerRef.current
    if (!canvasElement) {
      throw Error('can not get canvas dom instance')
    }
    const canvasXY = canvasElement.getBoundingClientRect()
    const left = (nodeClientX - (canvasXY.x || canvasXY.left)) / scale  - nodeWidth / 2
    const top = (nodeClientY - (canvasXY.y || canvasXY.top)) / scale - nodeHeight / 2
    const node = {
      top,
      left,
      id: UUID(),
      ...nodeData,
    }
    setNodes([...canvasData.nodes, node])
    triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.AddNode, {})
  }

  const handleCanvasChange = (type, data) => {
    handleCanvasOperationStorage(type, data)
    onChange(type, data)
  }

  const computContainerOrigin = () => {
    const wrapper = canvasWrapperRef.current?.getBoundingClientRect()
    const { width, height } = wrapper
    return {
      x: width / 2,
      y: height / 2
    }
  }

  const zoom = (param) => {
    const { containerScale } = zoomData
    let scale = containerScale
    if (param) {
      if (scale === 2) return
      scale = Math.round(scale * 10) + 1
    } else {
      if (scale === 0.2) return
      scale = Math.round(scale * 10) - 1
    }
    if (scale < 2) {
      scale = 2
    }
    if (scale > 20) {
      scale = 20
    }
    scale /= 10
    setContainerScale(scale)
    instanceRef.current?.setZoom(scale)
    instanceRef.current?.setCanvasParams({
      scale
    })
    instanceRef.current?.minMapRender()
    triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.Zoom, { scale })
  }

  const getCanvasNodeBound = () => {
    let maxLeft
    let maxTop
    let minLeft
    let minTop
    for (let i = 0; i < canvasData.nodes.length; i++) {
      const node = canvasData.nodes[i]
      const nodeLeft = node.left
      const nodeTop = node.top
      if (i === 0) {
        maxLeft = nodeLeft
        maxTop = nodeTop
        minLeft = nodeLeft
        minTop = nodeTop
      } else {
        if (nodeLeft > maxLeft) {
          maxLeft = nodeLeft
        }
        if (nodeLeft < minLeft) {
          minLeft = nodeLeft
        }
        if (nodeTop > maxTop) {
          maxTop = nodeTop
        }
        if (nodeTop < minTop) {
          minTop = nodeTop
        }
      }
    }
    return {
      maxLeft,
      minLeft,
      maxTop,
      minTop,
    }
  }

  const getInitCenterPosition = () => {
    const { width, height } = canvasWrapperRef.current?.getBoundingClientRect()
    const left = width / 2  - (200 + nodeWidth / 2) // input output left
    const top = height - 400; // output top
    return { left, top }
  }

  const fittoScreen = (init) => {
    // const { miniMapSize, dispatch, nodeConfig: { nodeWidth } } = this.props
    const { maxLeft, minLeft, maxTop, minTop } = getCanvasNodeBound()
    const { width, height } = canvasWrapperRef.current?.getBoundingClientRect()
    let scale = 1
    let left = 200
    let top = 200
    if (maxLeft !== undefined) {
      const scaleX = width / (maxLeft - minLeft + nodeWidth * 2)
      const scaleY = height / (maxTop - minTop + nodeWidth * 2)
      if (!init) scale = (scaleX > scaleY) ? scaleY : scaleX
      left = -((minLeft - nodeWidth / 2) * scale)
      top = -((minTop - nodeWidth / 2) * scale)
      if (scaleX > 0) {
        left += (width - (maxLeft - minLeft + nodeWidth * 2) * scale) / 2
      }
      if (scaleY > 0) {
        top += (height - (maxTop - minTop + nodeWidth * 2) * scale) / 2
      }
    }
    setContainerScale(scale)
    instanceRef.current?.setZoom(scale)
    if (containerRef.current) {
      containerRef.current.style.left = `${left}px`
      containerRef.current.style.top = `${top}px`
    }
    // instanceRef.current?.minMapRender()
    triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.Zoom, { scale })
  }

  const changeCommentVisible = useCallback((visible) => {
    setCanvasData(draft => {
      draft.commentVisible = visible
    })
  }, [])

  const changeResourceVisible = useCallback((visible) => {
    setCanvasData(draft => {
      draft.resourceVisible = visible
    })
  }, [])

  const changeMinMapVisible = useCallback(() => {
    setCanvasData(draft => {
      draft.minMapDisplay = !draft.minMapDisplay
      triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.SwitchMinMap, { minMapDisplay: draft.minMapDisplay })
    })
  }, [])

  const handleCanvasOperationStorage = (type, data) => {
    if (type === CanvasOperationEnum.Zoom) {
      // set local storageda
      const { scale } = data
      initStorageData.inlinecanvasParams.scale = scale
    }
    if (type === CanvasOperationEnum.DragCanvas) {
      const { left, top } = data
      initStorageData.inlinecanvasParams.left = left
      initStorageData.inlinecanvasParams.top = top
    }
    // if (type === CanvasOperationEnum.SwitchResource) {
    //   const { resourceVisible } = data
    //   initStorageData.resourceVisible = resourceVisible
    // }
    // if (type === CanvasOperationEnum.SwitchMinMap) {
    //   const { minMapDisplay } = data
    //   initStorageData.minMapDisplay = minMapDisplay
    // }
    localStorage.setItem(`workflow-status-${workflowId}`, JSON.stringify(initStorageData))
  }

  const miniRef = useRef(null)

  const getMiniMapRef = (ref) => {
    miniRef.current = ref.current
  }

  const getGConnections = () => {
    const connections = instanceRef.current?.getConnections()
    const gConnections = []
    for (const c of connections) {
      const p = c.getParameters()
      const item = {
        sourceInstanceId: p.sourceId,
        targetInstanceId: p.targetId,
        sourceModuleIOId: p.outputId,
        targetModuleIOId: p.inputId,
        sourceModuleIOName: p.sourceName,
        targetModuleIOName: p.targetName,
        sourcetModuleIOType: [p.sourceType],
        targetModuleIOType: [p.targetType],
      }
      gConnections.push(item)
    }
    return gConnections
  }

  function getSaveData (){
    // setCanvasData(draft => {
    //   draft.isRenderCanvasMap = true
    // })
    let nodeList = canvasData.nodes

    const length = (nodeList && nodeList.length) || 0
    if (length !== 0 && nodeList[0].level !== undefined) {
      nodeList = nodeList.map((item) => {
        const {level, ...otherProps} = item
        return otherProps
      })
    }

    // const canvas = layerRef.current?.canvas.toDataURL()
    return {
      locations: nodeList,
      connections: getGConnections(),
      // canvas,
    }
  }
  const classNameStr = classNames('pm-canvas-container', className)
  return (
    <CanvasContainer
      zoomData={zoomData}
      containerRef={containerRef}
      instanceRef={instanceRef}
      setScaleChangeTime={setScaleChangeTime}
      setContainerScale={setContainerScale}
      miniMapRef={miniRef}
      canvasWrapperRef={canvasWrapperRef}
    >
      <CanvasToolbar
        {...toolbar}
        workflowId={workflowId}
        readonly={readonly}
        fittoScreen={fittoScreen}
        onZoom={zoom}
        zoomScale={zoomData.containerScale}
        // commentVisible={canvasData.commentVisible}
        // resourceVisible={canvasData.resourceVisible}
        // changeCommentVisible={changeCommentVisible}
        // changeResourceVisible={changeResourceVisible}
        autoLayoutByLevel={autoLayoutByLevel}
      />
      {/* <MiniMapTool
        {...toolbar}
        onZoom={zoom}
        changeMinMapVisible={changeMinMapVisible}
        zoomScale={zoomData.containerScale}
      /> */}
      {/* {
        canvasData.resourceVisible && toolbar.resource.renderContent()
      } */}
      {/* {
        canvasWrapperRef.current && containerRef.current &&
        <MinMap
          {...toolbar}
          canvasData={canvasData}
          nodeWidth={nodeWidth}
          nodeHeight={nodeHeight}
          minLeft={canvasData.minLeft}
          minTop={canvasData.minTop}
          zoomData={zoomData}
          instanceRef={instanceRef}
          canvasWrapperRef={canvasWrapperRef}
          containerRef={containerRef}
          getMiniMapRef={getMiniMapRef}
          getCanvasNodeBound={getCanvasNodeBound}
          renderMiniNode={renderMiniNode}
          minMapDisplay={canvasData.minMapDisplay}
          layerRef={layerRef}
        />
      } */}
      <CanvasContext.Provider value={canvasContextData}>
        <div ref={drop} className='pm-canvas-drop' onClick={onClick}>
          <div ref={canvasWrapperRef} className={'pm-canvas-wrapper'}>
            <div
              ref={containerRef}
              className={classNameStr}
              id={classNameStr}
              scale={zoomData.containerScale}
              // transformOrigin: `${scaleOrigin.x}px ${scaleOrigin.y}px`,
              style={{ left: canvasStyle.left, top: canvasStyle.top, transform: `scale(${zoomData.containerScale})` }}
            >
              {
                canvasData.containerElement && <React.Fragment>
                  {canvasData.nodes && canvasData.nodes.map((item) => {
                    return renderNode ? renderNode({ ...item, nodeWidth, nodeHeight, startDrag }) : <DefaultCanvasNode key={item.id} nodeWidth={nodeWidth} nodeHeight={nodeHeight} startDrag={startDrag} {...item} />
                  })}
                </React.Fragment>
              }
            </div>
          </div>
        </div>
      </CanvasContext.Provider>
    </CanvasContainer>
  )
})

Canvas.defaultProps = {
  nodeWidth: 252,
  nodeHeight: 52,
  onClick: () => {},
  startDrag: () => {return true},
  getNodeData: (dragData) => new Promise<{}>((resolve) => { resolve(dragData) })
}

export default Canvas


