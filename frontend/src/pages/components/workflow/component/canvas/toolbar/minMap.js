import React, { FC, useRef, useEffect, useState, memo } from 'react';
import CanvasNode from '../canvasNode';
import DefaultCanvasMiniNode from './defaultCanvasMiniNode'
import MinMapEnum from '../../../enum/MinMapEnum';
import PubSub from 'pubsub-js'
import WorkFLowToolkit from '../../../utils/workFLowToolkit';
import { triggerCanvasOperation } from '../../../utils/util';
import MiniMapCanvas from './miniMapCanvas'

const MinMap = ({ canvasData, nodeWidth, nodeHeight, minMapDisplay, minLeft, minTop, zoomData, containerRef, canvasWrapperRef, instanceRef, canvasMapConfig, getMiniMapRef, getCanvasNodeBound, renderMiniNode, layerRef }) => {
  const miniSelectRef = useRef(null);
	const [styleData, setStyleData] = useState({
		scale: 1,
		left: 0,
    top: 0,
    canvasOffsetX: 0,
    canvasOffsetY: 0,
		mMSLeft: 0,
		mMSTop: 0,
		mMSWidth: 0,
		mMSHeight: 0
  });

	useEffect(() => {
		getMiniMapRef(miniSelectRef)
	}, [miniSelectRef])

	useEffect(() => {
		scribe();
		scribeMoveCenter();
		getMinMapData();
		return () => {
      PubSub.unsubscribe(MinMapEnum.Render);
      PubSub.unsubscribe(MinMapEnum.MoveCenter);
    }
  }, [canvasData.nodes])

	function scribe() {
		return PubSub.subscribe(MinMapEnum.Render, (msg, data) => {
			getMinMapData();
		})
	}

	function scribeMoveCenter() {
		return PubSub.subscribe(MinMapEnum.MoveCenter, (msg, data) => {
			moveCenter();
		})
	}

	const getInstance = () => {
		return WorkFLowToolkit.getJsPlumbInstance(containerRef?.current);
	}

  const moveCenter = () => {
    const container = 150;
    let { clientWidth, clientHeight, style: {left, top} } = document.querySelector('#minimapselect');
    const cW = parseFloat(clientWidth);
    const cH = parseFloat(clientHeight);
    const cL = parseFloat(left);
    const cT = parseFloat(top);
    const l = (150 - cW) / 2;
    const T = (150 - cH) / 2;
    const offseX =  l - cL;
    const offseT =  T - cT;
    const { miniMapMove } = getInstance().getMinMapParams();
		const canvasParmas = getInstance().getCanvasParams();
		const offsetX = offseX- miniMapMove.x;
		const offsetY = offseT - miniMapMove.y;
		if ( miniSelectRef.current ) {
			miniSelectRef.current.style.left = `${miniMapMove.left + l}px`;
			miniSelectRef.current.style.top = `${miniMapMove.top + T}px`;
		}
		const canvasLeft = canvasParmas.left - offsetX / miniMapMove.scale * canvasParmas.scale;
		const canvasTop = canvasParmas.top - offsetY / miniMapMove.scale * canvasParmas.scale;

		if (containerRef.current) {
			containerRef.current.style.left = `${canvasLeft}px`;
			containerRef.current.style.top = `${canvasTop}px`;
		}

    setTimeout(() => {
      const mapStyle = miniSelectRef.current?.style;
      const canvasStyle = containerRef.current?.style;
      getInstance().setCanvasParams({
        left: parseFloat(canvasStyle.left),
        top: parseFloat(canvasStyle.top),
      })
      getInstance().setMinMapParams({
        miniMapMove: {
          left: parseFloat(mapStyle.left),
          top: parseFloat(mapStyle.top),
          scale: styleData.scale,
          x: 0,
          y: 0,
          status: false,
        }
      })
      triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.DragCanvas, {
        left: parseFloat(canvasStyle.left),
        top: parseFloat(canvasStyle.top),
      });
    }, 0)

  }

	const onMiniMapMoveStart = (e) => {
		if (e.nativeEvent.which === 3) {
      return;
    }
		e.stopPropagation();
    const { left, top } = miniSelectRef.current?.style;
		getInstance().setMinMapParams({
			miniMapMove: {
				left: parseFloat(left),
				top: parseFloat(top),
				scale: styleData.scale,
				x: e.clientX,
				y: e.clientY,
				status: true,
			}
		})
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	const onMouseMove = (event) => {
		const { miniMapMove } = getInstance().getMinMapParams();
		const canvasParmas = getInstance().getCanvasParams();
		if (miniMapMove.status) {
			const offsetX = event.clientX - miniMapMove.x;
      const offsetY = event.clientY - miniMapMove.y;
      if ( miniSelectRef.current ) {
        miniSelectRef.current.style.left = `${miniMapMove.left + offsetX}px`;
        miniSelectRef.current.style.top = `${miniMapMove.top + offsetY}px`;
      }
			const canvasLeft = canvasParmas.left - offsetX / miniMapMove.scale * canvasParmas.scale;
      const canvasTop = canvasParmas.top - offsetY / miniMapMove.scale * canvasParmas.scale;

      if (containerRef.current) {
        containerRef.current.style.left = `${canvasLeft}px`;
			  containerRef.current.style.top = `${canvasTop}px`;
      }
		}
	}

	const onMouseUp = (event) => {
		const mapStyle = miniSelectRef.current?.style;
		const canvasStyle = containerRef.current?.style;
		getInstance().setCanvasParams({
			left: parseFloat(canvasStyle.left),
			top: parseFloat(canvasStyle.top),
		})
		getInstance().setMinMapParams({
			miniMapMove: {
				left: parseFloat(mapStyle.left),
				top: parseFloat(mapStyle.top),
				scale: styleData.scale,
				x: event.clientX,
				y: event.clientY,
				status: false,
			}
		})
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
		triggerCanvasOperation(triggerCanvasOperation.CanvasOperationEnum.DragCanvas, {
			left: parseFloat(canvasStyle.left),
			top: parseFloat(canvasStyle.top),
		});
	}

	const getMinMapData = () => {
		const { maxLeft, minLeft, maxTop, minTop } = getCanvasNodeBound();
		let scale = 1;
		let left = 0;
    let top = 0;
    let canvasOffsetX = 0;
    let canvasOffsetY = 0;
		const { width, height } = canvasWrapperRef.current?.getBoundingClientRect();
		const scaleX = 150 / (maxLeft - minLeft + nodeWidth);
		const scaleY = 150 / (maxTop - minTop + nodeHeight);
		if (scaleX > scaleY) {
      scale = scaleY;
      left = -minLeft * scale + (150 - (maxLeft-minLeft + nodeWidth) * scale) / 2;
      top =  -minTop *scale;
      // left = (maxTop - minTop + nodeHeight - maxLeft - minLeft) * scale / 2;
      // top = (nodeHeight / 2 - minTop) * scale;

		} else {
      scale = scaleX;
      left = -minLeft * scale;
      top = -minTop * scale + (150 - ((maxTop - minTop + nodeHeight) * scale)) / 2;
			// left = (nodeWidth / 2 - minLeft) * scale;
			// top = (maxLeft - minLeft + nodeWidth - maxTop - minTop) * scale / 2;
    }

    const x = minLeft < 0 ? Math.abs(minLeft) * scale : 0;
    const y = minTop < 0 ? Math.abs(minTop) * scale : 0;
    canvasOffsetX = (150 - (maxLeft - minLeft + nodeWidth) * scale ) / 2 + x;
    canvasOffsetY = (150 - (maxTop - minTop + nodeHeight) * scale ) / 2 + y;

		const canvasStyle = containerRef.current?.style;
    const canvasScale = containerRef.current?.getAttribute('scale');
		// const mMSLeft = left + (-nodeWidth / 2 - parseFloat(canvasStyle.left) / Number(canvasScale)) * scale;
    // const mMSTop = top + (-nodeHeight / 2 - parseFloat(canvasStyle.top) / Number(canvasScale)) * scale;
    const mMSLeft = left - (parseFloat(canvasStyle.left) / Number(canvasScale) * scale);
    const mMSTop = top - (parseFloat(canvasStyle.top) / Number(canvasScale) * scale);
		const mMSWidth = (width / Number(canvasScale)) * scale;
		const mMSHeight = (height / Number(canvasScale)) * scale;

		//算出mapSelect的scale给miniMapParams赋初始值
		const { miniMapMove } = instanceRef.current?.getMinMapParams();
		instanceRef.current?.setMinMapParams({
			miniMapMove: {
				...miniMapMove,
				scale
			}
		})

		setStyleData({
			// scale: Math.floor(scale * 100) / 100,
			scale,
			left,
      top,
      canvasOffsetX,
      canvasOffsetY,
			mMSLeft,
			mMSTop,
			mMSWidth,
			mMSHeight
		})

  }

	return (
		<div id="wraperminmap" className={`wraperminmap`} onMouseDown={(e) => { e.stopPropagation(); }} style={{ display: minMapDisplay ? 'block' : 'none'}}>
      {canvasData.isRenderCanvasMap && <MiniMapCanvas
        nodes={canvasData.nodes}
        nodeWidth={nodeWidth}
        nodeHeight={nodeHeight}
        scale={styleData.scale}
        offsetX={styleData.left}
        offsetY={styleData.top}
				layerRef={layerRef}
				canvasMapConfig={canvasMapConfig}
			/>
			}
			<div id="miniMap" className='minimap' style={{ position: 'relative' }}>
				<div
					ref={miniSelectRef}
					id="minimapselect"
					className='minimapselect'
					key='minimapselect'
					data-html2canvas-ignore
					style={{
						left: Number.isNaN(styleData.mMSLeft) ? 0 : styleData.mMSLeft,
						top: Number.isNaN(styleData.mMSTop) ? 0 : styleData.mMSTop,
						width: Number.isNaN(styleData.mMSWidth) ? 0 : styleData.mMSWidth,
						height: Number.isNaN(styleData.mMSHeight) ? 0 : styleData.mMSHeight,
						zIndex: 21,
					}}
					onMouseDown={onMiniMapMoveStart}
				/>
				<div
					id='minimapcanvas'
					className='minimapcanvas'
					style={{
						transform: `scale(${styleData.scale})`,
						left: Number.isNaN(styleData.left) ? 0 : styleData.left,
            top: Number.isNaN(styleData.top) ? 0 : styleData.top,
						position: 'absolute'
					}}
					scale={styleData.scale}
					key='minimapcanvas'
					onMouseDown={(e) => e.stopPropagation()}
				>
            {
              canvasData.containerElement && <React.Fragment>
                {canvasData.nodes && canvasData.nodes.map((item) => {
                  return renderMiniNode ? renderMiniNode({ ...item, nodeWidth, nodeHeight }) : <DefaultCanvasMiniNode key={item.id} id={item.id} nodeWidth={nodeWidth} nodeHeight={nodeHeight} {...item} />
                })}
              </React.Fragment>
            }
				</div>
			</div>
		</div>
	);
}


export default MinMap;
