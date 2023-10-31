import React from 'react';


const CanvasContext = React.createContext({
  nodes: [],
  addNode: ()=> {},
  delNode: ()=> {},
  copyNode: () => {},
  container: null,
});


export default CanvasContext;
