import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useImmer } from 'use-immer'
import { history, useParams } from 'umi'
import Workflow, { ItemPanel, ContainerPanel, Canvas, CanvasOperationEnum } from '../components/workflow'
import LeftTree from './components/leftTree'
import CanvasNode from './canvas/canvasNode'
import { IconFont} from 'components/icon'
import { Typography, Tooltip, message } from 'antd'
import { createNode, getFlow, saveFlow, getFlowPublishStatus } from 'services/flow'
import { setName, handleNodeData } from './util'
import RightInfo from './components/rightInfo'
import FlowModal  from './components/flowModal'
import PublishPrompt from 'components/publish-prompt'
import RunModal from 'components/flow-run'
import { MAXVARIABLES } from 'config'
import Run from 'components/flow-run'
import styles from './index.less'

const FlowDetail = () => {
  const canvasRef = useRef(null)
  const rightInfoRef = useRef(null)
  const showStatusRef = useRef(null)
  const { id: flowId } = useParams()

  const [state, setState] = useImmer({
    nodeList: [],
    edgeList: [],
    flowData: {},
    currNode: null,
    rightInfo: null,
    visible: false,
    ppVisible: false,
    runVisible: false,
    isReadOnly: false
  })
  const { isReadOnly } = state;

  useEffect(() => {
    getFlowData()
    getPublishStatus()
  }, [])

  const setFlowData = (data) => {
    const { config: {edges, nodes} } = data
    setState(draft => {
      draft.nodeList = getShowNodes(nodes)
      draft.edgeList = getShowEdges(edges)
      draft.flowData = data
      draft.rightInfo = { ...data, module_type: 'flow',}
      // draft.rightInfo = info ? info : {}
      // draft.currNode = info?.id
    })
  }

  const getPublishStatus = () => {
    getFlowPublishStatus({flow_id: flowId}).then(res => {
      if (res && res.published === 1) {
        setState(draft => {
          draft.isReadOnly = true
        })
      }
    })
  }

  const getFlowData = async () => {
    const res = await getFlow({id: flowId })
    if (res) {
      setFlowData(res)
    }
  }

  const toolbar = {
    isAbsolute: true,
    autoLayout: {
      show: true,
    },
  }

  const converseShowIo = (data) => {
    const newData = data.map(i => {
      return {
        ...i,
        id: i.name,
        name: i.name,
        value: i.type,
        type: i.value,
      }
    })
    return newData
  }

  const converseSaveIo = (data) => {
    const newData = data.map(i => {
      return {
        ...i,
        id: undefined,
        name: i.name,
        type: i.value,
        value: "",
      }
    })
    return newData
  }

  const getSaveNodes = (nodes) => {
    const newNodes = nodes.map(n => {
      const obj = {
        ...n,
        io: undefined,
        inputs: converseSaveIo(n.io.inputs),
        outputs: converseSaveIo(n.io.outputs),
      }
      return handleDelKeys(obj)
    })
    return newNodes
  }

  const getShowNodes = (nodes) => {
    const {left, top} = canvasRef.current.getInitCenterPosition()
    const getLeft = (n) => {
      if (n.left === 125 && n.module_type === 'input') return left
      if (n.left === 125 && n.module_type === 'output') return left
      return n.left
    }
    const getTop = (n) => {
      if (n.left === 125 && n.module_type === 'input') return 0
      if (n.left === 125 && n.module_type === 'output') return top
      return n.top
    }
    const newNodes = nodes.map(n => {
      return {
        ...n,
        io: {
          inputs: converseShowIo(n.inputs),
          outputs: converseShowIo(n.outputs),
        },
        inputs: undefined,
        outputs: undefined,
        left: getLeft(n),
        top: getTop(n)
      }
    })
    return newNodes
  }

  const getNodeData = async (data) => {
    const moduleInfo = await createNode({id:data.id, type: data.nodeType, flow_id: flowId})
    return {
      ...data,
      ...moduleInfo,
      name: getAliasName(moduleInfo.module_name),
      moduleName: moduleInfo.module_name,
      io: {
        inputs: converseShowIo(moduleInfo.inputs),
        outputs: converseShowIo(moduleInfo.outputs),
      }
    }
  }

  const getAliasName = (name) => {
    const nodeList = canvasRef.current.getNodes()
    const aliasArr = []
    nodeList.forEach(item => {
      if (item.name) {
        aliasArr.push({ name: item.name })
      }
    })
    console.log(name, aliasArr, 'getaliasname')
    return setName(name, aliasArr)
  }

  const getNodeContextMenuList = (node) => {
    const contextMenuList = []
    return contextMenuList
  }

  const copyNode = (data) => {
    canvasRef.current.copyNode(handleNodeData({ ...data, name: getAliasName(data.name) }))
  }

  const delNode = (data) => {
    canvasRef.current.deleteNode(handleNodeData(data))
    setTimeout(() => {
      handleCanvasClick()
    }, 10)
  }

  const publishNode = () => {
    handlePPModalVisible(true)
  }

  const onVisibleChangeByNodeMenu = (visible) => {
    // console.log('visible====>', visible)
  }

  const handleDelKeys = (data) => {
    const {copyNode, currNode, delNode, role_id, role_name, node, ...otherprops} = data
    return otherprops
  }

  const changeNodeParams = (node) => {
    const newNode = handleDelKeys(node)
    canvasRef.current.changeNode(newNode)
    setState(draft => {
      draft.rightInfo = {
        ...newNode,
        // type: newNode.moduleType,
      }
    })
    setTimeout(() => {
      saveFlowData()
    }, 100)
  }

  const getSaveEdges = (c) => {
    const saveConn = c.map(i => {
      return {
        source_node: i.sourceInstanceId,
        source_output_name: i.sourceModuleIOName,
        target_node: i.targetInstanceId,
        target_input_name: i.targetModuleIOName
      }
    })
    return saveConn
  }

  const getShowEdges = (c) => {
    const showConn = c.map(i => {
      return {
        sourceInstanceId: i.source_node,
        sourceModuleIOId: i.source_output_name,
        targetInstanceId: i.target_node,
        targetModuleIOId: i.target_input_name
      }
    })
    return showConn
  }

  const saveFlowData = async (r) => {
    const saveData = canvasRef.current.getSaveData()
    const res = await saveFlow({
      id: flowId,
      edges: getSaveEdges(saveData.connections),
      nodes: getSaveNodes(saveData.locations)
    })
    if (res) {
      r && rightInfoRef.current.refreshInputVariable?.()
      // setState(draft => {
      //   draft.edgeList = saveData.connections
      //   draft.nodeList = saveData.locations
      // })
    }
  }

  const isOutput = (id) => {
    return state.nodeList.find(f => f.id === id)?.module_type === 'output'
  }

  const isInput = (id) => {
    return state.nodeList.find(f => f.id === id)?.module_type === 'input'
  }

  const addOutputEndpoint = (id) => {
    const nodes = canvasRef.current.getSaveData().locations
    const node = nodes.find(f => f.id === id)
    if (node.io.inputs.length === MAXVARIABLES) {
      message.warning(`Add up to ${MAXVARIABLES} items！`)
      return
    }
    const ins = [...node.io.inputs]
    const name = ins[ins.length -1].name
    const newName =`result${Number(name.replace('result', '')) + 1}`
    const newNode = {
      ...node,
      io: {
        inputs: [...node.io.inputs, {
          defaultValue: null,
          id : newName,
          name: newName,
          type: "",
          value: "any"
        }],
        outputs: []
      }
    }
    canvasRef.current.changeNodeVersion(node, newNode)
  }

  const delOutputEndpoint = (id, endPoint) => {
    const nodes = canvasRef.current.getSaveData().locations
    const node = nodes.find(f => f.id === id)
    if (node.io.inputs.length === 1) return
    const copyIn = [...node.io.inputs]
    const currIndex = copyIn.findIndex(f => f.id === endPoint.inputId)
    copyIn.splice(currIndex, 1)
    const newNode = {
      ...node,
      io: {
        inputs: copyIn,
        outputs: []
      }
    }
    canvasRef.current.changeNodeVersion(node, newNode)
  }

  const getOutput = () => {
    const o = state.nodeList.find(f => f.module_type === 'output')
    return o;
  }

  const getInput = () => {
    const o = state.nodeList.find(f => f.module_type === 'input')
    return o;
  }

  const delAllEdgesEndIsOutput = (data) => {
    const newEdges = []
    const o = getOutput()
    data.edges.forEach(f => {
      if (f.sourceInstanceId === data.node.id && f.targetInstanceId === o?.id) {
        newEdges.push(f)
      }
    })
    newEdges.forEach(f => {
      delOutputEndpoint(o?.id, {inputId: f.targetModuleIOId})
    })
  }

  const getRemovedNodeHasEdgesOnInput = (data) => {
    const newEdges = []
    const i = getInput()
    data.edges.forEach(f => {
      if (f.targetInstanceId === data.node.id && f.sourceInstanceId === i?.id) {
        newEdges.push(f)
      }
    })
    return newEdges.length > 0 ? true : false
  }

  const onCanvasChange = (type, data) => {
    if (CanvasOperationEnum.AddConnection === type) {
      if (data?.info?.targetId && isOutput(data?.info?.targetId)) {
        addOutputEndpoint(data.info.targetId)
      }
      // refresh input variables
      const r = isInput(data.info?.sourceId)
      saveFlowData(r)
    }
    if (CanvasOperationEnum.RemoveConnection === type) {
      if (isOutput(data.info.targetId)) {
        delOutputEndpoint(data.info.targetId, data.endPoint)
      }
      // refresh input variables
      const r = isInput(data.info?.sourceId)
      saveFlowData(r)
    }
    if (CanvasOperationEnum.RemoveNode === type) {
      delAllEdgesEndIsOutput(data);
      // if removed node has edges on input need refresh input variables
      const r = getRemovedNodeHasEdgesOnInput(data)
      saveFlowData(r)
    }
    if (CanvasOperationEnum.AddNode === type || CanvasOperationEnum.CopyNode === type || CanvasOperationEnum.DragNode === type) {
      saveFlowData()
    }
  }

  const handleNodeClick = (node) =>{
    setState(draft => {
      let rightInfo = {
        ...node,
      }
      draft.rightInfo = rightInfo
      draft.currNode = node.id
    })
  }

  const handleCanvasClick = () => {
    // const info = state.nodeList.find(f => f.module_type === 'input')
    setState(draft => {
      draft.rightInfo = { module_type: 'flow'}
      draft.currNode = null
    })
  }

  const renderNode = (node) => {
    return (
      <CanvasNode
        node={node}
        key={node.id}
        onClick={handleNodeClick}
        contextMenuList={getNodeContextMenuList(node)}
        copyNode={copyNode}
        delNode={delNode}
        publishNode={publishNode}
        {...node}
        currNode={state.currNode}
        readonly={isReadOnly}
      />
    )
  }

  const canvasJsx = <Canvas
    workflowId={flowId}
    ref={canvasRef}
    toolbar={toolbar}
    initNodeList={state.nodeList}
    initEdgeList={state.edgeList}
    renderNode={renderNode}
    getNodeData={getNodeData}
    onChange={onCanvasChange}
    onClick={handleCanvasClick}
    startDrag={true}
    nodeWidth={198}
    nodeHeight={36}
    readonly={isReadOnly}
  />

  const goFlowList = () => {
    history.push('/flowList')
  }

  const handleModalVisible = (v) => {
    setState(d => {
      d.visible = v
    })
  }

  const handlePPModalVisible = (v) => {
    setState(d => {
      d.ppVisible = v
    })
  }

  const showStatus = () => {
    showStatusRef.current.changeShowStatus?.()
  }

  const handleSuccess = () => {
    setState(draft => {
      draft.isReadOnly = true
    })
  }

  const changeFlowName = (name) => {
    setState(draft => {
      draft.flowData.name = name
    })
  }

  return (
    <div className={styles.flowDetail}>
      <div className={styles.title}>
        <div className={styles.titleLeft}>
          <IconFont type="icon-flow"  style={{marginRight: 8, fontSize: 20, verticalAlign: 'text-bottom'}}/>
          <span className={styles.goFlowList} onClick={goFlowList}>Flow</span>
          {' > '}
          <Typography.Text ellipsis={{rows: 1,  tooltip: state.flowData.name || '...' }} style={{ width: '200px' }}>
            {state.flowData.name || '...'}
          </Typography.Text>
        </div>
        <div className={styles.titleRight}>
          <Run showStatus flowId={flowId} ref={showStatusRef} name={state.flowData.name}/>
          <Tooltip title={isReadOnly ? "Published flow can not be published" : "Publish App"}>
            <IconFont type="icon-publish1" className={`${styles.publish} ${isReadOnly ? styles.disabled : ''}`} onClick={isReadOnly ? null : () => handleModalVisible(true)} />
          </Tooltip>
          <Run flowId={flowId} handleShowStatus={showStatus} name={state.flowData.name}/>
          {
            state.visible && (
              <FlowModal
                visible={state.visible}
                currData={{id: flowId}}
                modalType="publish"
                onSuccess={handleSuccess}
                handleModalVisible={handleModalVisible}
                // queryList={queryList}
              />
            )
          }
        </div>
      </div>
      <div className={styles.main}>
        <Workflow>
          {
            <ItemPanel collapseMode="arrow" className="item-panel" width={312}>
              <LeftTree readonly={isReadOnly} />
            </ItemPanel>
          }
          <ContainerPanel>
            { canvasJsx }
          </ContainerPanel>
          <ItemPanel
            collapseDirection="left"
            collapseMode="arrow"
            width={320}
          >
            <RightInfo
              rightInfo={state.rightInfo}
              currNode={state.currNode}
              flowId={flowId}
              ref={rightInfoRef}
              canvasRef= {canvasRef}
              readonly={isReadOnly}
              changeFlowName={changeFlowName}
              changeNodeParams={changeNodeParams}
              converseShowIo={converseShowIo}
              converseSaveIo={converseSaveIo}
            />
          </ItemPanel>
        </Workflow>
        {
          state.ppVisible && (
            <PublishPrompt
              visible={state.ppVisible}
              prompt={{
                role_id: state.rightInfo?.params?.role?.[0].value,
                prompt:  state.rightInfo?.params.prompt,
                pro_id:  state.rightInfo?.module_id,
              }}
              handleModalVisible={handlePPModalVisible}
            />
          )
        }
      </div>
    </div>
  )
}

export default FlowDetail
