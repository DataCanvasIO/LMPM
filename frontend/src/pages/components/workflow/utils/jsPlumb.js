import { jsPlumb } from 'jsplumb'
import PubSub from 'pubsub-js'
import MinMapEnum from '../enum/MinMapEnum'
import { triggerCanvasOperation } from './util'

const nodeConfig = {
  nodeWidth: 226,
  nodeHeight: 32
}
const primary_color = '#7340C8'

function handleEndpointType(endpointType) {
  try {
    return JSON.parse(endpointType).toString()
  } catch (error) {
    return endpointType
  }
}

export function autoLayout(locations, jsPlumbDivInstance) {
  const length = (locations && locations.length) || 0
  if (length === 0 || locations[0].level === undefined) {
    return locations
  }
  const defaultConfig = {
    topHeight: 100,
    leftWidht: 60,
    moduleHeight: nodeConfig.nodeHeight,
    moduleWidth: nodeConfig.nodeWidth,
  }
  let defaultCanvas = { }
  // const jsplumbDivObj = document.getElementById('graph')
  if (jsPlumbDivInstance) {
    defaultCanvas = {
      width: jsPlumbDivInstance.clientWidth,
      height: jsPlumbDivInstance.clientHeight - 46,
    }
  }

  const tLObj = {}

  const currLevelLeft = (maxWidth, level) => {
    // 计算出当前级别模块栈的总体宽度
    const maxModuleWidth = tLObj[level] * defaultConfig.moduleWidth + (tLObj[level] - 1) * defaultConfig.leftWidht
    return maxWidth / 2 - maxModuleWidth / 2
  }

  /**
   * 返回当前层级高度
   * @param {*} firstTop 第一层级高度
   * @param {*} level 当前级别
   */
  const currLevelTop = (firstTop, level) => {
    return firstTop + (defaultConfig.moduleHeight + defaultConfig.topHeight) * (level - 1)
  }

  let maxWidth = 0
  let maxHeight = 0
  let maxWidthCount = 0
  let maxHeightCount = 0
  let firstTop = 0

  // 遍历出级别和数量
  locations.forEach(item => {
    if (tLObj[item.level]) {
      tLObj[item.level] = parseInt(tLObj[item.level], 10) + 1
    } else {
      tLObj[item.level] = 1
    }
  })

  maxWidthCount = Math.max(...Object.values(tLObj))
  maxWidth = ((maxWidthCount - 1) * defaultConfig.leftWidht) + (maxWidthCount * defaultConfig.moduleWidth)
  maxWidth = maxWidth > defaultCanvas.width ? maxWidth : defaultCanvas.width
  maxHeightCount = Object.keys(tLObj).length
  maxHeight = ((maxHeightCount - 1) * defaultConfig.topHeight) + (maxHeightCount * defaultConfig.moduleHeight)
  maxHeight = maxHeight > defaultCanvas.height ? maxHeight : defaultCanvas.height
  firstTop = (maxHeight - ((defaultConfig.moduleHeight + defaultConfig.topHeight) * maxHeightCount) - defaultConfig.topHeight) / 2

  Object.keys(tLObj).forEach(level => {
    const currLevelLocations = locations.filter(f => parseInt(f.level, 10) === parseInt(level, 10))
    const levelLeft = currLevelLeft(maxWidth, level)
    currLevelLocations.forEach((item, index) => {
      const subtraction = 0 // 画布默认向右偏移了200像素，node left减去200像素，达到居中效果
      const distanceLevel = level % 2 === 0 ? 1 : 0
      item.left = (levelLeft + (defaultConfig.moduleWidth + defaultConfig.leftWidht) * index) - subtraction + distanceLevel
      item.top = currLevelTop(firstTop, level) - subtraction
    })
  })
  return locations
}

class JsPlumbFactory {
  canvas
  currentEndPointType
  currentTargetEndPoint
  readonly
  connectorPaintStyle // 连线的样式
  connectorHoverStyle // 连线hover的样式
  connectorDraggingStyle
  endpointHoverSourceStyle //
  endpointHoverTargetStyle
  targetTypeList
  canvasParams
  minMapParams
  toolBarStatus
  canvasOperation
  isConnection
  constructor(readonly = false) {
    this.readonly = readonly
    this.canvasOperation = {}
    this.isConnection = false
    this.canvasParams = {
      left: 200,
      top: 200,
      scale: 1,
      x: 0,
      y: 0,
      status: false
    }
    this.minMapParams = {
      miniMapMove: {
        left: 0,
        top: 0,
        scale: 1,
        x: 0,
        y: 0,
        status: false
      }
    }
    this.currentEndPointType = undefined
    this.currentTargetEndPoint = undefined
    this.targetTypeList = {
      allall: [],
    }
    this.connectorPaintStyle = {
      strokeWidth: 1,
      // stroke: '#AAB7C5',
      // stroke: 'rgba(16, 38, 58, 1)',
      stroke: 'rgba(147, 157, 166, 100)',
      joinstyle: 'round',
      outlineStroke: 'transparent',
      outlineWidth: 2,
    }
    this.connectorHoverStyle = {
      strokeWidth: 2,
      // stroke: 'rgb(97, 183, 207)',
      stroke: primary_color,
      outlineWidth: 4,
      outlineStroke: 'transparent',
    }
    this.connectorDraggingStyle = {
      strokeWidth: 1,
      // stroke: 'rgb(97, 183, 207)',
      stroke: primary_color,
      outlineWidth: 4,
      outlineStroke: 'transparent',
    }
    this.endpointHoverSourceStyle = {
      radius: 6,
      // fill: '#07D6FF',
      // stroke: 'rgb(97, 183, 207)',
      stroke: primary_color,
      strokeWidth: 1,
    }
    this.endpointHoverTargetStyle = {
      fill: primary_color,
      stroke: primary_color,
    }
  }

  /**
   * 更爱是否只读
   * @param readonly
   */
  changeReadonly(readonly) {
    this.readonly = readonly
  }

  init = (container) => {
    this.canvas = jsPlumb.getInstance({
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      ConnectionOverlays: [
        ['Arrow', {
          location: -2,
          visible: false,
          width: 5,
          length: 7,
          id: 'ARROW',
          zIndex: 2020,
        }],
        ['Label', {
          location: 0.5,
          id: 'label',
          cssClass: 'aLabel',
          events: {
            click: (label) => {
              if (!this.readonly) {
                this.canvas.deleteConnection(label.component)
                triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.RemoveConnection, {info: label.component, endPoint: this.currentTargetEndPoint })
              }
            },
          },
        }],
      ],
      Container: container || 'pm-workflow',
    })
    // this.canvas.draggable(container)
    this.canvas.bind('connection', (info) => {
      const { sourceType, sourceId } = info.sourceEndpoint.getParameters()
      const { targetType, targetId } = info.targetEndpoint.getParameters()
      this.initConnection(info.connection)
      if (sourceId === targetId) {
        this.canvas?.deleteConnection(info.connection)
        // message.error(intl.get('project.workflow.noConnection'))
        this.clearHighLight()
        return
      }
      if (this.compareType(sourceType, targetType)) {
        this.canvas?.deleteConnection(info.connection)
        // message.error(intl.get('project.workflow.noConnection'))
        this.clearHighLight()
        return
      }
      this.isConnection && triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.AddConnection, {info})
      if (this.currentEndPointType) {
        // auto save
        // autoSave('save')
      }
    })

    this.canvas.bind('connectionDrag', (connection) => {
      this.isConnection = true
      this.setHighLight(connection)
    })

    this.canvas.bind('connectionDragStop', (connection) => {
      this.isConnection = false
      this.clearHighLight()
    })
  }

  nodeInit = (id, inputs, outputs, startDrag) => {
    this.addEndpoints(id, inputs, outputs)
    this.canvas.draggable(id, {
      start: () => {
        return !this.readonly
      },
      stop: () => {
        triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.DragNode, {})
        const { left, top } = document.getElementById(id)?.style
        this.canvasOperation.setNodeById && this.canvasOperation?.setNodeById(id, { top: parseFloat(top), left: parseFloat(left) })
        // this.minMapRender()
        // this.redrawMiniMap()
        // dragAutoSave()
      },
    })
  }

  sourceEndpoint = (name, type) => {
    return {
      endpoint: 'Dot',
      paintStyle: {
        // stroke: 'rgba(16, 38, 58, 0.25)',
        stroke: 'rgba(147, 157, 166, 100)',
        fill: 'transparent',
        radius: 4,
        strokeWidth: 1,
      },
      isSource: !this.readonly,
      maxConnections: -1,
      connector: ['Bezier', { // Flowchart
        curviness: 70,
        stub: [40, 60],
        gap: 8,
        cornerRadius: 5,
        alwaysRespectStubs: true,
      },],
      connectorStyle: this.connectorPaintStyle,
      connectorDraggingStyle: this.connectorDraggingStyle,
      hoverPaintStyle: this.endpointHoverSourceStyle,
      connectorHoverStyle: this.connectorHoverStyle,
      dragOptions: {},
      overlays: [
        ['Label', {
          location: [0.5, 3],
          label: `<div class='l'></div>${name} ${type}`,
          cssClass: 'endpointSourceLabel',
          id: 'opLabel',
        }],
      ],
    }
  }

  targetEndpoint = (name, type) => {
    return {
      endpoint: 'Dot',
      paintStyle: {
        // stroke: 'rgba(16, 38, 58, 0.25)',
        stroke: 'rgba(147, 157, 166, 100)',
        fill: 'transparent',
        radius: 4,
        strokeWidth: 1,
      },
      hoverPaintStyle: this.endpointHoverTargetStyle,
      maxConnections: 1,
      dropOptions: { hoverClass: 'hover', activeClass: 'active' },
      isTarget: true,
      overlays: [
        ['Label', {
          location: [0.5, -2.7],
          label: `<div class='l'></div>${name} ${type}`,
          cssClass: 'endpointTargetLabel',
          id: 'pLabel',
        }],
      ],
    }
  }

  addEndpoints = (toId, inputs, outputs) => {
    if (inputs && Array.isArray(inputs)) {
      const il = inputs.length
      for (let i = 0; i < il; i++) {
        const targetUUID = 'in' + toId + inputs[i].id
        // n个点， n+1个缝隙， 每份占比(1 / (il + 1)， left值需对应乘以份数(即 索引 + 1)， 0.07为适配
        const left = 0.07 + (i + 1) * (1 / (il + 1))
        const endPoint = this.canvas.addEndpoint(`${toId}`, this.targetEndpoint(inputs[i].name, inputs[i].value), {
          anchor: [left, 0, 0, -1, 0, 0],
          uuid: targetUUID,
          detachable: false,
          parameters: {
            inputId: inputs[i].id,
            targetId: toId,
            targetEndId: targetUUID,
            targetType: inputs[i].value,
            targetName: inputs[i].name,
          },
          events: {
            mouseover: () => {
              endPoint.showOverlay('pLabel')
            },
            mouseout: () => {
              endPoint.hideOverlay('pLabel')
            },
          },
        })
        if (!this.targetTypeList[inputs[i].value]) {
          this.targetTypeList[inputs[i].value] = []
        }
        this.targetTypeList['allall'].push(targetUUID)
        this.targetTypeList[inputs[i].value].push(targetUUID)
        // endPoint.bind('mouseover', (endpoint) => {
        //   if (endpoint.type === 'Dot') {
        //     this.currentTargetEndPoint = endpoint.getParameters()
        //   }
        // })
      }
    }

    if (outputs && Array.isArray(outputs)) {
      const ol = outputs.length
      for (let j = 0; j < ol; j++) {
        const sourceUUID = 'out' + toId + outputs[j].id
        // n个点， n+1个缝隙， 每份占比(1 / (il + 1)， left值需对应乘以份数(即 索引 + 1)， 0.07为适配
        const left = 0.07 + (j + 1) * (1 / (ol + 1))
        const newEndpoint = this.canvas.addEndpoint(`${toId}`, this.sourceEndpoint(outputs[j].name, outputs[j].value), {
          anchor: [left, 1, 0, 1, 0, 1],
          uuid: sourceUUID,
          detachable: false,
          parameters: {
            outputId: outputs[j].id,
            sourceId: toId,
            sourceEndId: sourceUUID,
            sourceType: outputs[j].value,
            sourceName: outputs[j].name,
          },
          events: {
            mouseover: () => {
              newEndpoint.showOverlay('opLabel')
            },
            mouseout: () => {
              newEndpoint.hideOverlay('opLabel')
            },
          },
        })
        newEndpoint.bind('mouseover', (endpoint) => {
          if (endpoint.type === 'Dot') {
            this.currentEndPointType = handleEndpointType(endpoint.getParameters().sourceType)
          }
        })
      }
    }
  }

  initConnection = (connection) => {
    connection.getOverlay('label').setLabel('×')
    connection.bind('mouseover', (e) => {
      connection.showOverlay('label')
      this.currentTargetEndPoint = e.endpoints[1].getParameters()
    })
    connection.bind('mouseout', () => {
      connection.hideOverlay('label')
    })
  }

  setConnections = (connections) => {
    // if (this.initdraw && !this.stopdraw) {
    //   this.canvas.setSuspendDrawing(true)
    //   this.stopdraw = true
    // }

    Array.isArray(connections) && connections.forEach((item) => {
      this.canvas.connect({
        uuids: [
          'out' + item.sourceInstanceId + item.sourceModuleIOId,
          'in' + item.targetInstanceId + item.targetModuleIOId,
        ],
      })
    })

    // this.canvas.setSuspendDrawing(false, true)
    // if (this.initdraw && this.stopdraw && !this.timer) {
    //   this.canvas.setSuspendDrawing(false, true)
    //   this.stopdraw = false
    //   this.initdraw = false
    // }
  }

  getHighlightList = () => {
    this.currentEndPointType = handleEndpointType(this.currentEndPointType)
    if (this.currentEndPointType === 'any') {
      return this.targetTypeList['allall']
    }
    if (Array.isArray(this.targetTypeList[this.currentEndPointType])) {
      if (this.targetTypeList['any']) {
        return [...this.targetTypeList[this.currentEndPointType], ...this.targetTypeList['any']]
      }
      return [...this.targetTypeList[this.currentEndPointType]]
    }
    return this.targetTypeList['any'] ? this.targetTypeList['any'] : []
  }

  setHighLight = (connection) => {
    const { sourceId } = connection
    this.getHighlightList().forEach((id) => {
      if (this.canvas?.getEndpoint(id)?.elementId !== sourceId
        && this.canvas?.getEndpoint(id)?.connections.length < 1) {
        this.canvas?.getEndpoint(id).addClass('ableDrag')
      }
    })
  }

  clearHighLight = () => {
    this.canvas?.selectEndpoints().removeClass('ableDrag')
  }

  compareType = (a, b) => {
    return a !== 'any' && b !== 'any' && b !== handleEndpointType(a)
  }

  setZoom = (value) => {
    this.canvas.setZoom(value)
  }

  getZoom = () => {
    return this.canvas.getZoom()
  }

  getCanvasParams = () => {
    return this.canvasParams
  }

  getToolBarStatus = () => {
    return this.toolBarStatus
  }

  setToolBarStatus = (data) => {
    this.canvasParams = { ...this.toolBarStatus, ...data }
  }

  setCanvasParams = (data) => {
    this.canvasParams = { ...this.canvasParams, ...data }
  }

  getMinMapParams = () => {
    return this.minMapParams
  }

  setMinMapParams = (data) => {
    this.minMapParams = { ...this.minMapParams, ...data }
  }

  changeNodeVersion = (id, io, newIO) => {
    let flag = true
    let flagOut = true
    const connections = this.canvas.getConnections()
    const newConnections = [] // 连着当前节点的所有线
    for (const c of connections) {
      const p = c.getParameters()
      if (p.sourceId === id || p.targetId === id) {
        newConnections.push({ ...p })
      }
    }
    // if (io.inputs && newIO.inputs) {
    //   for (let i = 0 i < io.inputs.length i++) {
    //     if (!((newIO.inputs[i] && io.inputs[i].name === newIO.inputs[i].name)
    //       && (newIO.inputs[i] && io.inputs[i].value === newIO.inputs[i].value))) {
    //       flag = false
    //       break
    //     }
    //     if (io.inputs.length > newIO.inputs.length) {
    //       flag = false
    //     }
    //   }
    // }
    // if (io.outputs && newIO.outputs) {
    //   for (let i = 0 i < io.outputs.length i++) {
    //     if (!((newIO.outputs[i] && io.outputs[i].name === newIO.outputs[i].name)
    //       && (newIO.outputs[i] && io.outputs[i].value === newIO.outputs[i].value))) {
    //       flagOut = false
    //       break
    //     }
    //   }
    //   if (io.outputs.length > newIO.outputs.length) {
    //     flagOut = false
    //   }
    // }
    this.emptyNode(id, io.inputs, io.outputs)
    this.nodeInit(id, newIO.inputs, newIO.outputs)
    if (flag || flagOut) {
      const result = []
      if (flag && newIO.inputs) {
        for (let i = 0; i < newIO.inputs.length; i++) {
          for (const p of newConnections) {
            // 当前节点输入圈id
            if (newIO.inputs[i].id === p.inputId) {
              result.push(['out' + p.sourceId + p.outputId, 'in' + p.targetId + newIO.inputs[i].id])
              // break
            }
          }
        }
      }
      if (flagOut && newIO.outputs) {
        for (let i = 0; i < newIO.outputs.length; i++) {
          for (const p of newConnections) {
            if (newIO.outputs[i].id === p.outputId) {
              result.push(['out' + p.sourceId + newIO.outputs[i].id, 'in' + p.targetId + p.inputId])
              // break
            }
          }
        }
      }
      result.forEach(item => {
        this.canvas.connect({
          uuids: [
            ...item,
          ],
        })
      })
    }
  }

  emptyNode = (id, inputs, outputs) => {
    if (inputs && Array.isArray(inputs)) {
      const il = inputs.length
      for (let i = 0; i < il; i++) {
        const targetUUID = 'in' + id + inputs[i].id
        this.canvas.deleteEndpoint(targetUUID)
      }
    }
    if (outputs && Array.isArray(outputs)) {
      const ol = outputs.length
      for (let j = 0; j < ol; j++) {
        const sourceUUID = 'out' + id + outputs[j].id
        this.canvas.deleteEndpoint(sourceUUID)
      }
    }
  }

  autoLayout = (locations, jsPlumbDivInstance) => {
    return autoLayout(locations, jsPlumbDivInstance)
  }

  minMapRender = () => {
    PubSub.publish(MinMapEnum.Render)
  }

  getConnections = () => {
    return this.canvas.getConnections()
  }

  resetCanvas = () => {
    this.canvas.deleteEveryEndpoint()
  }

  getLocationsLevel = (locations, connections) => {
    const level1Arr = locations.filter((f) => {
      f.level = 1
      return f.io.inputs.length === 0
    })
    const connectionMap= {}
    connections.forEach((i) => {
      const sourceKey = `${i.sourceInstanceId}*${i.sourceModuleIOId}`
      const targetKey = `${i.targetInstanceId}*${i.targetModuleIOId}`
      if (!connectionMap[sourceKey]) {
        connectionMap[sourceKey] = [targetKey]
      } else {
        connectionMap[sourceKey].push(targetKey)
      }
    })
    let level = 2
    const setLevel = (prevLevelArr) => {
      const levelArr = []
      const outputLine = []
      prevLevelArr.forEach(prev => {
        prev.io.outputs.forEach((out) => {
          outputLine.push(`${prev.id}*${out.id}`)
        })
      })
      const findLcation = (targetKey) => {
        locations.forEach((l) => {
          const ints = l.io.inputs
          if (ints) {
            ints.forEach((i) => {
              if (`${l.id}*${i.id}` === targetKey) {
                l.level = level
                levelArr.push(l)
              }
            })
          }
        })
      }
      const targetArr = []
      outputLine.forEach(i => {
        Array.isArray(connectionMap[i]) && connectionMap[i].forEach((m)=> {
          targetArr.push(m)
        })
      })
      targetArr.forEach(t => {
        findLcation(t)
      })
      if (levelArr.length > 0) {
        level ++
        setLevel(levelArr)
      }
    }
    setLevel(level1Arr)
    return locations
  }
}

export default JsPlumbFactory
