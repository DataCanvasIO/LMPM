import React from 'react';


const WorkflowContext = React.createContext({
  animationAttr: {
    pausedLeft: true,
    reverseLeft: false,
    pausedRight: true,
    reverseRight: false,
    isLeft: false,
  },
});


export default WorkflowContext;
