import  React,{FC, memo, useState} from 'react';
import SplitPane from 'react-split-pane'
// export interface SplitProps{
//   children:React.ReactChild,
//   panelSize: string | number;
// }
const SplitPanel = ({children, panelSize = '70%', ...otherProps})=>{
  return (
     <SplitPane size={panelSize} maxSize={-40} split="horizontal" {...otherProps} style={{position: "relative"}}>
        {children}
      </SplitPane>
  )
}

export default memo(SplitPanel);
