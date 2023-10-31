import React, { FC, useRef, useEffect, useState } from 'react';
import JsPlumb from '../../utils/jsPlumb';
import { useImmer } from "use-immer";
import WorkFLowToolkit from '../../utils/workFLowToolkit';
import { triggerCanvasOperation } from '../../utils/util'


const CanvasContainer = ({children, zoomData, containerRef, instanceRef, setScaleChangeTime, setContainerScale, miniMapRef, canvasWrapperRef}) => {
  const canvasRef = useRef(null);
  const moveRef = useRef(false);
  const getInstance = () => {
    return WorkFLowToolkit.getJsPlumbInstance(containerRef?.current);
  }

  const onMouseMove = (event) => {
    const { status, x, y, scale } = getInstance().getCanvasParams();
    // const { miniMapMove } = getInstance().getMinMapParams();
    moveRef.current = true;
    if (status) {
      const offsetX = event.clientX - x;
      const offsetY = event.clientY - y;
      const {left, top} = getInstance().getCanvasParams();
      containerRef.current.style.left = `${left + offsetX}px`;
      containerRef.current.style.top = `${top + offsetY}px`;
      // miniMapRef.current.style.left = `${miniMapMove.left - offsetX / scale * miniMapMove.scale}px`;
      // miniMapRef.current.style.top = `${miniMapMove.top - offsetY / scale * miniMapMove.scale}px`;
    }
  }

  const handleWheelChange = (e) => {
    const {deltaY, containerScale, scaleChangeTime} = zoomData;
    const currentTime = new Date();
    if ((currentTime - scaleChangeTime) > 20) {
      // const { inlinecanvasParams: { scale }, WorkFlowInstance, inlinecanvasParams } = this.props;
      const scale = containerScale;
      let deltaYoffset = 0;
      const currentScale = instanceRef.current?.getZoom();
      let newScale;
      let change = 1;
      if (e.deltaY > 0) {
        deltaYoffset = e.deltaY;
        change = -1;
      } else {
        deltaYoffset = -e.deltaY;
      }
      if (deltaYoffset > deltaY) {
        if ((deltaYoffset - deltaY) > 10) {
          newScale = currentScale + change * 0.1;
        }
        if ((deltaYoffset - deltaY) > 150) {
          newScale = currentScale + change * 0.2;
        }
      } else if (deltaYoffset > 10) {
        newScale = currentScale + change * 0.1;
      } else if (deltaYoffset > 150) {
        newScale = currentScale + change * 0.2;
      }
      if (newScale) {
        if (newScale > 2) {
          newScale = 2;
        }
        if (newScale < 0.2) {
          newScale = 0.2;
        }
        setScaleChangeTime(currentTime);
        setContainerScale(newScale);
        instanceRef.current?.setZoom(newScale);
        instanceRef.current?.setCanvasParams({
         scale: newScale
        })
        triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.Zoom, { scale: newScale });
      }
    }
  }


  const onMouseUp = (event) => {
    const canvasStyle = containerRef?.current.style;
    canvasWrapperRef.current.style.cursor = 'grab'
    // const mapStyle = miniMapRef?.current.style;
    getInstance().setCanvasParams({
      left: parseFloat(canvasStyle.left),
      top: parseFloat(canvasStyle.top),
      x: event.clientX,
      y: event.clientY,
      status: false
    })
    const { miniMapMove } = getInstance().getMinMapParams();
    // getInstance().setMinMapParams({
    //   miniMapMove: {
    //     ...miniMapMove,
		// 		left: parseFloat(mapStyle.left),
		// 		top: parseFloat(mapStyle.top)
		// 	}
		// })
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    moveRef.current && triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.DragCanvas, {
      left: parseFloat(canvasStyle.left),
      top: parseFloat(canvasStyle.top),
    })
    moveRef.current = false;
  }

  const onMouseDown = (event) => {
    if (event.nativeEvent.which === 3) {
      return;
    }
    event.stopPropagation();
    canvasWrapperRef.current.style.cursor = 'grabbing'
    const canvasStyle = containerRef.current.style;
    getInstance().setCanvasParams({
      left: parseFloat(canvasStyle.left),
      top: parseFloat(canvasStyle.top),
      x: event.clientX,
      y: event.clientY,
      status: true
    })

    // const mapStyle = miniMapRef?.current.style;
    // const { miniMapMove } = getInstance().getMinMapParams();
    // getInstance().setMinMapParams({
    //   miniMapMove: {
    //     ...miniMapMove,
		// 		left: parseFloat(mapStyle.left),
		// 		top: parseFloat(mapStyle.top)
		// 	}
		// })
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // 
  return (
    <div ref={canvasRef} className={'pm-canvas'}  onWheel={handleWheelChange} onMouseDown={onMouseDown}>
      {children}
    </div>
  );
}


export default CanvasContainer;
