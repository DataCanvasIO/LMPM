import PubSub from 'pubsub-js';
import CanvasOperationEnum from '../enum/CanvasOperationEnum'
import CanvasEnum from '../enum/CanvasEnum'

export const triggerCanvasOperation = (type, data) => {
    PubSub.publish(CanvasEnum.Operation, { type , data });
}

triggerCanvasOperation.CanvasOperationEnum = CanvasOperationEnum;
