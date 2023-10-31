import React, { memo, useContext, useMemo } from 'react';

const miniCanvasWrapper = (Component) => {
  return memo((props) => {
     return <Component  {...props} />
  })
}

export default miniCanvasWrapper;
