import JsPlumb from './jsPlumb';


class JsPlumbFactory {

  instanceMap;

  constructor() {
    this.instanceMap = {};
  }

  getJsPlumbInstance(container) {
    // debugger;
    if (this.instanceMap[container]) {
      return this.instanceMap[container];
    }

    if (!container) {
      throw Error('not found jsplumb instance container');
    } else {
      const length = Object.keys(this.instanceMap).length;
      if (length === 0) {
        throw Error('not found jsplumb instance instanceMap');
      }
    }
    console.warn(this.instanceMap, container);
    throw Error('not found jsplumb instance');
  }

  createJsPlumbInstance(container, readonly = false) {
    if (this.instanceMap[container]) {
      return this.instanceMap[container];
    }
    let jsPlumbInstance = new JsPlumb(readonly);
    jsPlumbInstance.init(container);
    // jsPlumbInstance.
    this.instanceMap[container] = jsPlumbInstance;
    return jsPlumbInstance;
  }

  removeJsPlumbInstance(container) {
    if (this.instanceMap[container]) {
      delete this.instanceMap[container] ;
    }
  }

  removeAllJsPlumbInstance() {
    this.instanceMap = {};
  }

  getInstanceMap() {
    return this.instanceMap;
  }
}

export default new JsPlumbFactory();
