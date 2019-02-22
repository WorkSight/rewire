import * as React            from 'react';
import Modal, { ActionType } from '../models/Modal';
import classNames            from 'classnames';
import {Observe}             from 'rewire-core';
import Typography            from '@material-ui/core/Typography';
import Dialog                from '@material-ui/core/Dialog';
import Button, {ButtonProps} from '@material-ui/core/Button';
import Divider               from '@material-ui/core/Divider';
import Icon                  from '@material-ui/core/Icon';
import Grow                  from '@material-ui/core/Grow';
import {Theme}               from '@material-ui/core/styles';
import './Dialog.css';
import {WithStyle, withStyles} from './styles';

let styles = (theme: Theme) => ({
  root: {
    width: '100%',
    overflowY: 'hidden',
  },
  scrollPaper: {
    maxHeight: 'calc(100% - 72px)',
  },
  buttons: {
    alignSelf: 'flex-end',
    display: 'flex',
    flexShrink: '0',
    margin: '15px',
    '& > button': {
      marginLeft: '15px',
    },
  },
  heading: {
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    flexDirection: 'column',
    margin: '15px 15px 0px 15px',
    '& > hr': {
      marginTop: '15px',
      marginBottom: '0px',
      width: '85%',
      border: '1px solid #eee'
    },
  },
  childrenContainer: {
    overflowY: 'auto',
    margin: '1px 0px',
    paddingTop: '15px',
    paddingBottom: '15px',
    position: 'relative',
  },
  childrenContainerActionsNoDivider: {
    paddingBottom: '0px',
  },
  divider: {
    margin: '0px',
    height: '1px',
  },
});

export interface IDefaultActionRendererStyles {
  button?: string;
  icon?: string;
  label?: string;
}
export type ActionRenderType = (props: {label: string, action: ActionType, isDisabled: boolean, variant?: ButtonProps['variant'], classes?: IDefaultActionRendererStyles}) => JSX.Element;
export const DefaultActionRenderer: ActionRenderType = ({label, action, isDisabled, variant, classes}) => (
  <Observe render={() => (
    <Button className={classes && classes.button} type={action.type} color={action.type ? 'primary' : action.color} variant={variant} disabled={isDisabled || action.disabled()} onClick={action.action}>
      {action.icon && <Icon className={classes && classes.icon} style={{marginRight: '8px'}}>{action.icon}</Icon>}
      <span className={classes && classes.label}>{label}</span>
    </Button>
  )} />
);

const TRANSITION_TIMEOUT = 220;
const Transition = (props: any) => <Grow {...props} timeout={TRANSITION_TIMEOUT} onEntered={(node => node.style.transform = 'none')} />;

export interface IDialogProps {
  dialog                : Modal;
  classes?              : React.CSSProperties;
  fullScreen?           : boolean;
  disableEscapeKeyDown? : boolean;
  hideBackdrop?         : boolean;
  disableTransition?    : boolean;
  hasDivider?           : boolean;
  transition?           : (props: any) => JSX.Element;
  transitionDuration?   : number;
  title?                : (dialog: Modal) => JSX.Element;
  maxWidth?             : 'xs' | 'sm' | 'md' | 'lg' | false;
  ButtonRenderer?       : ActionRenderType;
}

type DialogProps = WithStyle<ReturnType<typeof styles>, IDialogProps>;

class DialogInternal extends React.Component<DialogProps> {
  render() {
    const {classes, children, dialog, ButtonRenderer, fullScreen, maxWidth, title, disableEscapeKeyDown, hideBackdrop, transition, transitionDuration, disableTransition} = this.props;
    const escapeAction            = disableEscapeKeyDown ? undefined : () => dialog.close();
    const transitionToUse         = transition ? transition : Transition;
    const transitionDurationToUse = transitionDuration !== undefined ? transitionDuration : TRANSITION_TIMEOUT;
    const transitionAction        = disableTransition ? undefined : transitionToUse;
    const transitionTime          = disableTransition ? 0 : transitionDurationToUse;
    const hasTitle                = dialog.title || title;
    const hasActions              = dialog.actions && Object.keys(dialog.actions).length > 0;
    const hasDivider              = hasActions && this.props.hasDivider !== undefined ? this.props.hasDivider : true;

    return (
      <Observe render={() => (
        <Dialog classes={{paper: classes.root, paperScrollPaper: classes.scrollPaper}} open={dialog.isOpen} fullWidth maxWidth={maxWidth} hideBackdrop={hideBackdrop} transitionDuration={transitionTime} TransitionComponent={transitionAction} fullScreen={fullScreen} disableEscapeKeyDown={disableEscapeKeyDown} onEscapeKeyDown={escapeAction}>
          {hasTitle &&
            <div className={classes.heading}>
              <Typography variant='h6'>{(title && title(dialog)) || dialog.title}</Typography>
              <hr/>
            </div>}
            <div className={classNames(classes.childrenContainer, hasActions && !hasDivider ? classes.childrenContainerActionsNoDivider : '')}>
              {children}
            </div>
          {hasDivider && <Divider className={classes.divider} />}
          {hasActions && <div className={classes.buttons}>{
              Object.keys(dialog.actions).map(label => ((ButtonRenderer && <ButtonRenderer key={label} label={label} action={dialog.actions[label]} isDisabled={dialog.isDisabled} />) || <DefaultActionRenderer key={label} label={label} action={dialog.actions[label]} isDisabled={dialog.isDisabled} />))
          }</div>}
        </Dialog>
      )} />
    );
  }
}

export default withStyles(styles, DialogInternal);
