import React, { FC, useEffect, useRef } from 'react'
import classNames from 'classnames'
import TweenOne from 'rc-tween-one'
import { animation, animationCenterLeft, animationCenterRight } from '../../utils/animation'
import WorkflowContext, { AnimationAttr } from '../../context/workflowContext'
import { DndProvider, useDrop } from 'react-dnd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Icon } from 'antd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import './workflow.less'
import './index.less'

function generator({ suffixCls, displayName }) {
  return (BasicComponent) => {
    return class Adapter extends React.Component {
      static displayName = displayName

      static ContainerPanel

      static ItemPanel

      renderComponent = () => {
        return <BasicComponent prefixCls={suffixCls} {...this.props} />
      }

      render() {
        return <React.Fragment>{this.renderComponent()}</React.Fragment>
      }
    }
  }
}

class BasicLayout extends React.Component {
  changeIsLeft = (direction, isLeft) => {
    const { animationAttr } = this.state
    this.setState({
      animationAttr: {
        ...animationAttr,
        isLeft
      }
    }, () => {
      const currAnimationAttr = this.state.animationAttr
      const type = !currAnimationAttr[`collapse${isLeft ? 'Left' : 'Right'}`] ? 'play' : 'reverse'
      this.collapseAnimation(direction, type)
    })
  }

  state = {
    animationAttr: {
      pausedLeft: true,
      reverseLeft: true,
      pausedRight: true,
      reverseRight: true,
      collapseLeft: false,
      collapseRight: false,
      isLeft: false,
    },
    changeIsLeft: this.changeIsLeft,
  }

  /**
   * left right panel collapse animation
   */
  collapseAnimation = (direction = 'left', type = 'play') => {
    const stateObj = {}
    const currDirection = direction === 'left' ? 'Left' : 'Right'
    if (type === 'play') {
      stateObj[`paused${currDirection}`] = false
      stateObj[`reverse${currDirection}`] = false
      stateObj[`collapse${currDirection}`] = true
    } else if (type === 'reverse') {
      stateObj[`paused${currDirection}`] = false
      stateObj[`reverse${currDirection}`] = true
      stateObj[`collapse${currDirection}`] = false
    }
    this.setState({
      animationAttr: {
        ...this.state.animationAttr,
        ...stateObj,
      }
    })
  }

  render() {
    const { prefixCls, style, width, className, children, ...others } = this.props
    const { animationAttr, changeIsLeft } = this.state
    const classString = classNames(
      prefixCls,
      className,
    )
    return (
      <WorkflowContext.Provider value={{ animationAttr, changeIsLeft }}>
        <DndProvider backend={HTML5Backend}>
          <div className={classString}>{children}</div>
        </DndProvider>
      </WorkflowContext.Provider>
    )
  }
}

const Basic = (props) => {
  // const  = useRef(null)
  const { prefixCls, style, width, className, children, tagName, ...others } = props
  const classString = classNames(prefixCls, className)
  // const [{ canDrop, isOver }, drop] = useDrop({
  //   accept: 'node',
  //   drop: (props, monitor) => {
  //     const endXY = monitor.getClientOffset()
  //     PubSub.publish(CanvasEnum.Add, {nodeClientX: endXY.x, nodeClientY: endXY.y})
  //   },
  //   collect: (monitor) => ({
  //     isOver: monitor.isOver(),
  //     canDrop: monitor.canDrop(),
  //   }),
  // })

  return <WorkflowContext.Consumer>
    {
      ({ animationAttr }) => {
        return (
          <TweenOne
            style={{ ...style, width }}
            className={classString}
            animation={animationAttr.isLeft ? animationCenterLeft : animationCenterRight}
            paused={animationAttr.isLeft ? animationAttr.pausedLeft : animationAttr.pausedRight}
            reverse={animationAttr.isLeft ? animationAttr.reverseLeft : animationAttr.reverseRight}
          >
            <div className={'dropContainer'}>
              {children}
            </div>
          </TweenOne>
        )
      }
    }
  </WorkflowContext.Consumer>
}

const BasicItemPanel = (props) => {
  const {
    prefixCls,
    style,
    width,
    collapseMode,
    collapseDirection,
    collapseClassName,
    className,
    children,
    tagName,
    ...others
  } = props
  const classString = classNames(prefixCls, className)
  const collapseClassString = classNames(`collapse`, collapseClassName, {
    [`collapseLeft`]: collapseDirection === 'left',
    [`collapseRight`]: collapseDirection === 'right',
  })
  const collapse = (direction = 'left', changeIsLeft) => {
    const isLeft = direction === 'left'
    changeIsLeft && changeIsLeft(direction, isLeft)
  }

  return <WorkflowContext.Consumer>
    {
      ({ animationAttr, changeIsLeft }) => {
        return (
          <div className={'panel'}>
            <TweenOne
              style={{ ...style, width }}
              className={classString}
              animation={animation}
              paused={collapseDirection === 'left' ? animationAttr.pausedLeft : animationAttr.pausedRight}
              reverse={collapseDirection === 'left' ? animationAttr.reverseLeft : animationAttr.reverseRight}
            >
              {children}
            </TweenOne>
            <div
              className={collapseClassString}
              onClick={() => { collapse(collapseDirection, changeIsLeft) }}
            >
              <span>
                {/* {(collapseMode === 'arrow') ? 
                  ((collapseDirection === 'left' ? !animationAttr.reverseLeft : animationAttr.reverseRight) ? <LeftOutlined /> :<RightOutlined />) : 
                  <span>...</span>
                } */}
                 <span>...</span>
              </span>
            </div>
          </div>
        )
      }
    }
  </WorkflowContext.Consumer>
}

const Workflow  = generator({
  suffixCls: 'pm-workflow',
  displayName: 'Workflow',
})(BasicLayout)

const ItemPanel = generator({
  suffixCls: 'itemPanel',
  displayName: 'ItemPanel',
})(BasicItemPanel)

ItemPanel.defaultProps = {
  collapseDirection: 'right'
}

const ContainerPanel = generator({
  suffixCls: 'containerPanel',
  displayName: 'ContainerPanel',
})(Basic)

Workflow.ItemPanel = ItemPanel
Workflow.ContainerPanel = ContainerPanel

export default Workflow
