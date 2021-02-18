import { DndProvider, createDndContext } from 'react-dnd';
import { HTML5Backend }                  from 'react-dnd-html5-backend';
import * as React                        from 'react';

const dndContext = createDndContext(HTML5Backend);

function useDndProviderElement(props: any) {
  const manager = React.useRef(dndContext);

  if (!props.children) return null;

  return <DndProvider manager={manager.current.dragDropManager!}>{props.children}</DndProvider>;
}

export default function DragAndDrop(props: any) {
  const dndElement = useDndProviderElement(props);
  return <>{dndElement}</>;
}