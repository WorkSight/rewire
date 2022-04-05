import * as React                from 'react';
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

let dialogStyles = (theme: Theme) => ({
  root: {
    margin: '0px',
    height: '100%',
  },
  heading: {
    cursor: 'move',
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
  classes?: any;
  DialogProps: Omit<DialogProps, 'PaperComponent' | 'classes' | 'maxWidth' | 'fullWidth' | 'fullScreen'>;
  DraggableResizableBoxProps: Omit<DraggableResizableBoxProps, 'bounds' | 'dragHandleClassName' | 'default' | 'classes' | 'className'>;
  defaultWidth?: 'xs' | 'sm' | 'md' | 'lg';
}

export type DraggableResizableDialogProps = WithStyle<ReturnType<typeof dialogStyles>, IDraggableResizableDialogProps>;

class DraggableResizableDialog extends React.Component<DraggableResizableDialogProps> {
  draggableResizableBoxRef: React.RefObject<Rnd>;

  constructor(props: DraggableResizableDialogProps) {
    super(props);

    this.draggableResizableBoxRef = React.createRef();
  }

  getDefaultWidth(width?: string): number | string {
    let defaultWidth: number | string;
    switch(width) {
      case 'xs':
        defaultWidth = 400;
        break;
      case 'sm':
        defaultWidth = 600;
        break;
      case 'md':
        defaultWidth = 960;
        break;
      case 'lg':
        defaultWidth = 1280;
        break;
      default:
        defaultWidth = 'auto';
        break;
    }

    return defaultWidth;
  }

  PaperComponent = (props: PaperProps) => {
    const ref          = this.draggableResizableBoxRef;
    const defaultWidth = this.getDefaultWidth(this.props.defaultWidth)
    React.useEffect(() => {
      const currRef    = ref?.current;
      const dialogSize = currRef?.resizable?.size;
      const parentSize = currRef?.resizable?.getParentSize();
      if (currRef && dialogSize && parentSize) {
        const startX = (parentSize.width - dialogSize.width) / 2;
        const startY = (parentSize.height - dialogSize.height) / 2;
        currRef.updatePosition({ x: startX, y: startY });
      }
    }, [])

    return (
      <div className={this.props.classes.draggableResizableDialogContainer}>
        <DraggableResizableBox
          {...this.props.DraggableResizableBoxProps}
          innerRef={ref}
          className={this.props.classes.draggableResizableDialogRoot}
          dragHandleClassName='draggable-resizable-dialog-title'
          default={{x: 0, y: 0, width: defaultWidth, height: 'auto'}}
          bounds='parent'
        >
          <Paper {...props} />
        </DraggableResizableBox>
      </div>
    );
  }

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
    return (
      <Dialog {...this.props.DialogProps} classes={this.props.classes} HeaderComponent={this.RenderDialogHeader} PaperComponent={this.PaperComponent} maxWidth={false} fullWidth={false} fullScreen={false}>
        {this.props.children}
      </Dialog>
    );
  }
}

export default withStyles(dialogStyles, DraggableResizableDialog);
