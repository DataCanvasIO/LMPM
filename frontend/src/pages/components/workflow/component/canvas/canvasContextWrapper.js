import React, { FC, memo, useContext, useMemo } from 'react';
import CanvasContext from '../../context/canvasContext';

const CanvasContextWrapper = (Component) => {
  return memo((props) => {
    const context = useContext(CanvasContext);
     return <Component {...context} {...props} />
  })
}

export default CanvasContextWrapper;
