import React, { useEffect, useRef } from 'react'
import { useImmer } from 'use-immer'
import { Tree, Input, Typography } from 'antd'
import DragItem from './dragNode'
import { SearchOutlined } from '@ant-design/icons'
import { debounceFn } from 'utils'
import { IconFont } from 'components/icon'
import { getModuleTree } from 'services/flow'
import useInterval from '../../../hooks/useInterval'
import styles from './index.less'

const { Search } = Input
const { DirectoryTree } = Tree

const LeftTree = (props) => {
  const [state, setState] = useImmer({
    treeData:[],
    expandedKeys: [],
    autoExpandParent: false,
    time: null,
    topLevelNameArr: []
  })

  const keyWordsRef = useRef('')
  
  const { treeData } = state

  useEffect(() => {
    queryTreeData()
    setState(draft => {
      draft.time = 5000
    })
  }, [])

  useInterval(() => {
    queryTreeData()
  }, state.time)

  const queryTreeData = () => {
    getModuleTree({keyWords: keyWordsRef.current}).then(res => {
      const arr = []
      res.map(i => {
        arr.push(i.name)
      })
      setState(d => {
        d.treeData = res
        d.topLevelNameArr = arr
      })

    })
  }

  const getTopLevel = (item) => {
    // if (item.name === 'Prompt' || item.name === 'Tool' || item.name === 'Vector Database') {
    //   return true
    // }
    if (state.topLevelNameArr.includes(item.name)) {
      return true
    }
    return false
  }

  const renderIcon = (item) => {
    // if (getTopLevel(item)) {
    //   return <BugOutlined />
    // }
    if (item.name === 'Prompt') return <IconFont type="icon-prompt" style={{fontSize: 16}} />
    if (item.name === 'Tool') return <IconFont type="icon-tool" style={{fontSize: 20}} />
    if (item.name === 'Vector Database') return <IconFont type="icon-a-VectorDatabase" style={{fontSize: 16}} />
    return <IconFont type="icon-prompt" style={{fontSize: 16}} />
  }

  const renderTreeNode = (data) => {
    return Array.isArray(data) && data.map((item) => {
      if (item.childs) {
        return (
          <Tree.TreeNode
            key={item.id}
            icon={renderIcon(item)}
            className={getTopLevel(item) ? styles.parents : null}
            title={<div className={styles.treeTitle}>
              {/* <div className={styles.name}></div>  */}
              <Typography.Text style={{maxWidth: '200px'}} ellipsis={{rows: 1,  tooltip: item.name}}>{item.name}</Typography.Text>
              <div className={styles.count}>{item.child_count}</div>
            </div>}
            dataRef={item}
            isLeaf={false}
          >
            {renderTreeNode(item.childs)}
          </Tree.TreeNode>
        )
      }
      return (
        <Tree.TreeNode
          key={item.id}
          className={styles.promptNode}
          // className={ ['prompt', 'script', 'vectordb'].includes(item.type) ? styles.promptNode : null}
          title={(
            <DragItem
              text={item.name}
              id={item.id}
              data={item}
              dragData={{ ...item, readonly: props.readonly}}
            />
          )}
          dataRef={item}
        />
      )
    })
  }

  const onExpand = (expandedKeys) => {
    setState(d => {
      d.expandedKeys = expandedKeys
      d.autoExpandParent = false
    })
  }

  const renderTree = (data) => {
    return (
      <DirectoryTree
        onExpand={onExpand}
        // showIcon={false}
        multiple
        autoExpandParent={state.autoExpandParent}
        // key='graphModule'
        expandedKeys={state.expandedKeys}
        // blockNode
      >
        { renderTreeNode(data) }
      </DirectoryTree>
    )
  }

  const onModuleSearch = async (e) => {
    const value = e.target.value
    keyWordsRef.current = value
    if (value && value.length > 0) {
      const newData = await getModuleTree({keyWords: value})
      const gData = []
      const generateList = (data) => {
        for (let i = 0; i < data.length; i++) {
          const node = data[i]
          const id = node.id
          const name = node.name
          if (node.id) gData.push({ id, name })
          if (node.childs) {
            generateList(node.childs, node.id)
          }
        }
      }
      generateList(newData) // state.treeData
      const getParentKey = (key, tree) => {
        let parentKey
        for (let i = 0; i < tree.length; i++) {
          const node = tree[i]
          if (node.childs) {
            if (node.childs.some(item => item.id === key)) {
              parentKey = node.id
            } else if (getParentKey(key, node.childs)) {
              parentKey = getParentKey(key, node.childs)
            }
          }
        }
        return parentKey
      }
      const expandedKeys = gData.map((item) => {
        if (item.name && item.name.toUpperCase().includes(value.toUpperCase())) {
          return getParentKey(item.id, newData) // state.treeData
        }
        return null
      }).filter((item, i, self) => item && self.indexOf(item) === i)
      setState(d => {
        d.expandedKeys = expandedKeys
        d.autoExpandParent = true
        d.treeData = newData
      })
    } else {
      const newData = await getModuleTree({keyWords: ''})
      setState(d => {
        d.expandedKeys = []
        d.treeData = newData
      })
    }
  }

  return (
    <div className={styles.leftTree}>
      <div className={styles.search}>
        {/* <Search 
          placeholder="Search name" 
          allowClear 
          onSearch={onModuleSearch} 
          size="large" 
          style={{ width: 280, margin: "15px 16px" }} 
        /> */}
        <Input
          placeholder="Search module name"
          className={styles.searchInput}
          onInput={debounceFn(onModuleSearch, 400)}
          suffix={<SearchOutlined style={{ color: 'rgba(15,15,15,0.15)', cursor: 'pointer' }} />}
        /> 
      </div>
      <div className={styles.list}>
        {renderTree(treeData)}
      </div>
    </div>
  )
}

export default LeftTree
