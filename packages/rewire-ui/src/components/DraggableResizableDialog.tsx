import React                     from 'react';
import { Observe }               from 'rewire-core';
import classNames                from 'classnames';
import Paper, { PaperProps }     from '@material-ui/core/Paper';
import Typography                from '@material-ui/core/Typography';
import { Theme }                 from '@material-ui/core/styles';
import DraggableResizableBox, {
  DraggableResizableBoxProps,
  Rnd,
}                                from './DraggableResizableBox';
import Dialog, {
  DialogProps,
  HeaderComponentProps
}                                from './Dialog';
import { WithStyle, withStyles } from './styles';

const dialogStyles = (_theme: Theme) => ({
  root: {
    margin: '0px',
    height: '100%',
  },
  heading: {
    cursor: 'move',
    '& img': {
      pointerEvents: 'none',
    }
  },
  scrollPaper: {
    maxHeight: 'none',
  },
  paperWidthFalse: {
    maxWidth: 'none',
  },
  draggableResizableDialogContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    margin: '32px',
    width: 'calc(100% - 64px)',
    height: 'calc(100% - 64px)',
  },
  draggableResizableDialogRoot: {
    position: 'static !important',
    flexShrink: '1 !important',
  },
});

export interface IDraggableResizableDialogProps {
  DialogProps: Omit<DialogProps, 'PaperComponent' | 'classes' | 'maxWidth' | 'fullWidth' | 'fullScreen'>;
  DraggableResizableBoxProps?: Omit<DraggableResizableBoxProps, 'bounds' | 'dragHandleClassName' | 'default' | 'classes' | 'className'>;
  defaultWidth: 'xs' | 'sm' | 'md' | 'lg' | number | string;
  defaultHeight?: number | string;
  classes?: any;
  children?: React.ReactNode;
}

export type DraggableResizableDialogProps = WithStyle<ReturnType<typeof dialogStyles>, IDraggableResizableDialogProps>;

class DraggableResizableDialog extends React.Component<IDraggableResizableDialogProps> {
  draggableResizableBoxRef: React.RefObject<Rnd>;

  static defaultProps = {
    defaultWidth: 'auto',
    defaultHeight: 'auto',
  };

  constructor(props: DraggableResizableDialogProps) {
    super(props);

    this.draggableResizableBoxRef = React.createRef();
  }

  getDefaultWidth(width: 'xs' | 'sm' | 'md' | 'lg' | number | string): number | string {
    switch(width) {
      case 'xs':
        return 400;
      case 'sm':
        return 600;
      case 'md':
        return 960;
      case 'lg':
        return 1280;
      default:
        return width;
    }
  }

  PaperComponent = (props: PaperProps) => {
    const ref           = this.draggableResizableBoxRef;
    const defaultWidth  = this.getDefaultWidth(this.props.defaultWidth);
    const defaultHeight = this.props.defaultHeight;
    React.useEffect(() => {
      const currRef    = ref?.current;
      const dialogSize = currRef?.resizable?.size;
      const parentSize = currRef?.resizable?.getParentSize();
      if (currRef && dialogSize && parentSize) {
        let dialogWidth    = dialogSize.width;
        let dialogHeight   = dialogSize.height;
        const parentWidth  = parentSize.width;
        const parentHeight = parentSize.height;
        let updateSize     = false;

        if (dialogWidth > parentWidth) {
          dialogWidth = parentWidth;
          updateSize  = true;
        }
        if (dialogHeight > parentHeight) {
          dialogHeight = parentHeight;
          updateSize   = true;
        }
        if (updateSize) {
          currRef.updateSize({ width: dialogWidth, height: dialogHeight });
        }

        const startX = (parentWidth - dialogWidth) / 2;
        const startY = (parentHeight - dialogHeight) / 2;
        currRef.updatePosition({ x: startX, y: startY });
      }
    }, []);

    const draggableProps = this.props as DraggableResizableDialogProps;
    return (
      <div className={draggableProps.classes.draggableResizableDialogContainer}>
        <DraggableResizableBox
          {...draggableProps.DraggableResizableBoxProps}
          innerRef={ref}
          className={draggableProps.classes.draggableResizableDialogRoot}
          dragHandleClassName='draggable-resizable-dialog-title'
          default={{x: 0, y: 0, width: defaultWidth, height: defaultHeight ?? 'auto'}}
          bounds='parent'
        >
          <Paper {...props} />
        </DraggableResizableBox>
      </div>
    );
  };

  RenderDialogHeader(props: HeaderComponentProps): JSX.Element {
    const {dialog, classes, title} = props;
    const hasTitle                 = dialog.title || title;

    return (
      <Observe render={() => (
        <div className={classNames('draggable-resizable-dialog-title', classes.heading)}>
          {hasTitle &&
            < >
            <Typography variant='h6'>{(title && title(dialog)) || dialog.title}</Typography>
            <hr/>
            </>
          }
        </div>
      )} />
    );
  }

  render() {
    const {draggableResizableDialogContainer, draggableResizableDialogRoot, ...dialogClasses} = this.props.classes;

    return (
      <Dialog {...this.props.DialogProps} classes={dialogClasses} HeaderComponent={this.RenderDialogHeader} PaperComponent={this.PaperComponent} maxWidth={false} fullWidth={false} fullScreen={false}>
        {this.props.children}
      </Dialog>
    );
  }
}

const X = withStyles(dialogStyles, DraggableResizableDialog);
export default X;