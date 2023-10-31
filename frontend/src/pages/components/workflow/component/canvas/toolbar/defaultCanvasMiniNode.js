import React from 'react'
import MiniCanvasNode from './minNode'

const DefaultCanvasMiniNode = props => {
  return (
    <>
      {props.name}
    </>
  )
}

export default MiniCanvasNode(DefaultCanvasMiniNode)
