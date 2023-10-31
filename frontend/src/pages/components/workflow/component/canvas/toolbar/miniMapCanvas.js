import React, { FC, useEffect, useRef } from 'react'
import CanvasNode from '../canvasNode'
import { Layer, Rect, Stage, Text } from 'react-konva'
import konva from 'konva'

const MinMapCanvas = ({ nodes, nodeWidth, nodeHeight, scale, offsetX, offsetY, layerRef, canvasMapConfig }) => {
	const stageRef = useRef()

	useEffect(() => {
		// console.log(stageRef.current.canvas.toDataURL())  // 
	}, [])

	return (
		<Stage  width={150} height={150} style={{position: 'fixed', top: 150 , right: 180, background: '#f7f7f7', display: 'none' }}>
			<Layer ref={layerRef}>
				{nodes.map((item) => {
          const nodeLeft = item.left * scale + offsetX
          const nodeTop = item.top * scale + offsetY
          const getCanvasNodeStyleByType = canvasMapConfig.styleConfig
          let color = "#1976D2"
          if (getCanvasNodeStyleByType) {
            const { color: propColor } = getCanvasNodeStyleByType(item.moduleType)
            color = propColor
          }
          let name = item.name
          if (name.length > 12) {
            name = item.name.substring(0, 11)
          }
          return (
            <>
              <Rect
                key={`RECT-${item.id}`}
                x={nodeLeft}
                y={nodeTop}
                radius={50}
                width={nodeWidth * scale}
                height={nodeHeight * scale}
                stroke={color}
                strokeWidth={0.6}
              />
              <Text
                text={name}
                key={`text-${item.id}`}
                fontSize={14 * scale}
                width={nodeWidth * scale}
                height={nodeHeight * scale}
                align='center'
                // lineHeight={nodeHeight * scale}
                color="#10263A"
                x={nodeLeft}
                y={nodeTop + (nodeHeight - 14) * scale / 2}
              />
            </>
          )
        })}
			</Layer>
		</Stage>
	)
}


export default MinMapCanvas
