import * as React                                         from 'react';
import {
  Resizable,
  ResizableProps,
}                                                         from 're-resizable';
export {
  Enable as ResizableBoxEnable,
  HandleStyles as ResizableBoxHandleStyles,
  HandleClassName as ResizableBoxHandleClassName,
  Size as ResizableBoxSize,
  HandleComponent as ResizableBoxHandleComponent,
  ResizeCallback as ResizableBoxResizeCallback,
  ResizeStartCallback as ResizableBoxResizeStartCallback,
}                                                         from 're-resizable';

export type ResizableBoxProps = ResizableProps;

class ResizableBox extends React.Component<ResizableBoxProps> {
  constructor(props: ResizableBoxProps) {
    super(props);
  }

  render() {
    const {children, ...restProps} = this.props;

    return (
      <Resizable
        {...restProps}
      >
        {children}
      </Resizable>
    );
  }
}

export default ResizableBox;
