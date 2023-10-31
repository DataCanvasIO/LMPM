const defaultAnimation = {
  repeat: 0,
  yoyo: true,
  duration: 500,
};
export const animation = { ...defaultAnimation, width: '0px', overflow: 'hidden' };
export const animationCenterRight = { ...defaultAnimation, marginRight: '0px' };
export const animationCenterLeft = { ...defaultAnimation, marginLeft: '0px' };
