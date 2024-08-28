import React                                                     from 'react';
import {
  Rnd,
  Props as RndProps,
}                                                                     from 'react-rnd';
export type {
  Rnd,
  ResizeEnable as DraggableResizableBoxResizeEnable,
  HandleStyles as DraggableResizableBoxResizeHandleStyles,
  HandleClasses as DraggableResizableBoxResizeHandleClasses,
  HandleComponent as DraggableResizableBoxResizeHandleComponent,
  Grid as DraggableResizableBoxGrid,
  RndResizeStartCallback as DraggableResizableBoxResizeStartCallback,
  RndResizeCallback as DraggableResizableBoxResizeCallback,
  RndDragCallback as DraggableResizableBoxDragCallback,
}                                                                     from 'react-rnd';
export type {
  ResizableBoxSize as DraggableResizableBoxSize,
}                                                                     from './ResizableBox';

export interface DraggableResizableBoxProps extends RndProps {
  innerRef?: React.RefObject<Rnd>;
}

class DraggableResizableBox extends React.Component<DraggableResizableBoxProps> {
  constructor(props: DraggableResizableBoxProps) {
    super(props);
  }

  render() {
    const {children, innerRef, ...restProps} = this.props;

    return (
      <Rnd
        ref={innerRef}
        {...restProps}
      >
        {children}
      </Rnd>
    );
  }
}

export default DraggableResizableBox;
