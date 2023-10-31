import React, { FC } from 'react';
import CanvasContextWrapper from './miniCanvasWrapper';

const WrapperNode = (Component) => {

	const MinNode = (props) => {
		const {nodeWidth, nodeHeight, left, top, id, ...otherProps} = props;
		// const nodeLeft = left ? (left - nodeWidth / 2) : 0;
		// const nodeTop = top ? (top - nodeHeight / 2) : 0;
		const nodeLeft = left || 0 ;
		const nodeTop = top || 0;
		return (
			<div
				className='miniNode'
				id={`mini${id}`}
				style={{ left: nodeLeft, top: nodeTop, width: nodeWidth, height: nodeHeight }}
			>
			 	<Component {...otherProps} />
			</div>
		);
	}

	return CanvasContextWrapper(MinNode);
}

export default WrapperNode;
