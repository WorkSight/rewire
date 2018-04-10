import React                 from 'react';
import Modal, { ActionType } from '../models/Modal';
import Observe               from 'rewire-core/Observe';
import Typography            from 'material-ui/Typography';
import Dialog                from 'material-ui/Dialog';
import Button                from 'material-ui/Button';
import Icon                  from 'material-ui/Icon';
import './Dialog.css';
import Grow                  from 'material-ui/transitions/Grow';
import decorate, { WithStyle } from './styles';

let styles = {
  root: {
    width: '100%'
  },
  buttons: {
    alignSelf: 'flex-end',
    display: 'flex',
    margin: 16,
    '& > button': {
      marginLeft: 16
    }
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    margin: 16,
    '& > hr': {
      marginTop: 16,
      width: '85%',
      border: '1px solid #eee'
    }
  }
};

export type ActionRenderType = (props: {label: string, action: ActionType, isDisabled: boolean}) => JSX.Element;
export const DefaultActionRenderer: ActionRenderType = ({label, action, isDisabled}) => (
  <Observe render={() => (
    <Button type={action.type} color={action.type ? 'primary' : action.color} disabled={isDisabled || action.disabled()} onClick={action.action}>
    {action.icon && <Icon style={{marginRight: '8px'}}>{action.icon}</Icon>}
    {label}
  </Button>
  )} />
);

const TRANSITION_TIMEOUT = 220;
const Transition = (props: any) => <Grow {...props} timeout={TRANSITION_TIMEOUT} onEntered={(node => node.style.transform = 'none')} />;

export interface DialogProps {
  dialog         : Modal;
  fullScreen?    : boolean;
  title?         : (dialog: Modal) => JSX.Element;
  maxWidth?      : 'xs' | 'sm' | 'md' | false;
  ButtonRenderer?: ActionRenderType;
}

class DialogInternal extends React.Component<WithStyle<typeof styles, DialogProps>> {
  render() {
    const {classes, children, dialog, ButtonRenderer, fullScreen, maxWidth, title} = this.props;
    return (
      <Observe render={() => (
        <Dialog open={dialog.isOpen} fullWidth maxWidth={maxWidth} transition={Transition} fullScreen={fullScreen} onEscapeKeyDown={(evt) => dialog.close()}>
          {dialog.title &&
            <div className={classes.heading}>
              <Typography variant='title'>{(title && title(dialog)) || dialog.title}</Typography>
              <hr />
            </div>}
            {children}
          {(Object.keys(dialog.actions).length > 0) && <div className={classes.buttons}>{
            Object.keys(dialog.actions).map(label => ((ButtonRenderer && <ButtonRenderer key={label} label={label} action={dialog.actions[label]} isDisabled={dialog.isDisabled} />) || <DefaultActionRenderer key={label} label={label} action={dialog.actions[label]} isDisabled={dialog.isDisabled} />))
          }</div>}
        </Dialog>
      )} />
    );
  }
}

export default decorate(styles)<DialogProps>(DialogInternal);
