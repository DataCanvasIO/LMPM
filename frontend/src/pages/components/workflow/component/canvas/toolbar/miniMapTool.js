import React, { FC, useEffect } from 'react';
import { Toolbar } from '../';
import { Icon, Divider, Tooltip, Switch } from 'antd';
import { PlusOutlined , MinusOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import '../canvas.less';


const MiniMapTool = ({ className, minMap, zoom, onZoom, zoomScale,  changeMinMapVisible, }) => {


  const handleNavigator = () => {
    // minMap.onClick && minMap.onClick();
    changeMinMapVisible()
  }

  // useEffect(() => {
  //   const storageData = localStorage.getItem(`workflow-status-${workflowId}`)
  //   if (storageData) {
  //     const initStorageData = JSON.parse(storageData);
  //     setToolbar((draft) => {
  //       draft.commentVisible = initStorageData.commentVisible;
  //       draft.resourceVisible = initStorageData.resourceVisible;
  //     })
  //   }
  // }, [])

  const toolbarOnMouseDown = (e) => {
    e.stopPropagation();
  }


  const classNameStr = classNames('pm-canvas-mimimaptool', className);
  return (
    <div className={`${classNameStr}`} onMouseDown={toolbarOnMouseDown}>
        <>
            {zoom.show && <>
              {/* <Divider type="vertical" /> */}
              <div>
                <MinusOutlined style={{ cursor: 'pointer' }} onClick={() => onZoom(false)} />
                <span style={{ userSelect: 'none', display: 'inline-block', width: 59, textAlign: 'center' }}>{`${parseInt(zoomScale * 100)}%`}</span>
                <PlusOutlined  style={{ cursor: 'pointer' }} onClick={() => onZoom(true)}/>
              </div></>}
            {minMap.show && <><Divider type="vertical" />
              <Tooltip placement="top" title={'导航器'}>
                <Icon onClick={handleNavigator} type="compass" style={{ cursor: 'pointer' }} />
              </Tooltip>
            </>}
          </>
    </div>
  );
}
MiniMapTool.defaultProps = {
  minMap: {
    show: true,
    onClick: () => { },
  },
  zoom: {
    show: true,
    onClick: () => { },
  },
  onZoom: (operation) => {},
  zoomScale: 1,
}

export default MiniMapTool;
