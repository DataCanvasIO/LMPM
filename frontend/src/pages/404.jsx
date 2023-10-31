import React from 'react';
import image404 from '@/assets/404.png';

export default () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
        flexDirection: 'column',
      }}
    >
      <img src={image404} alt="404" />
    </div>
  );
};
