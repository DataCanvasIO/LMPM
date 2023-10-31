import React from 'react';
import CanvasNode from './canvasNode';


const DefaultCanvasNode = props => {
  return (
    <>
      {props.name}{props.status}
    </>
  );
}


export default CanvasNode(DefaultCanvasNode);
