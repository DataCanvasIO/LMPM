import Workflow from './component/workflow';
import Canvas, {INode, IEdge} from './component/canvas/index';
import CanvasNode from './component/canvas/canvasNode';
import MiniCanvasNode from './component/canvas/toolbar/minNode';
import DragNode from './component/drag-node';
import SplitPanel  from './component/splitpanel';
import BottomPanel from './component/bottom-panel';
import CanvasOperationEnum from './enum/CanvasOperationEnum';

const ItemPanel = Workflow.ItemPanel;
const ContainerPanel = Workflow.ContainerPanel;
export {
  ItemPanel,
  ContainerPanel,
  Canvas,
  CanvasNode,
  MiniCanvasNode,
  DragNode,
  INode,
  IEdge,
  SplitPanel,
  BottomPanel,
  CanvasOperationEnum
};

export default Workflow;
