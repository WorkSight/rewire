import * as React                from 'react';
import Modal, { ActionType }     from '../models/Modal';
import classNames                from 'classnames';
import {isNullOrUndefined}       from 'rewire-common';
import {
  Observe,
  disposeOnUnmount,
  watch }                        from 'rewire-core';
import Typography                from '@material-ui/core/Typography';
import Dialog                    from '@material-ui/core/Dialog';
import Button, { ButtonProps }   from '@material-ui/core/Button';
import Divider                   from '@material-ui/core/Divider';
import Icon                      from '@material-ui/core/Icon';
import Grow                      from '@material-ui/core/Grow';
import { Theme }                 from '@material-ui/core/styles';
import { WithStyle, withStyles } from './styles';
import './Dialog.css';

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
  buttonRoot: {
  },
  buttonIcon: {
  },
  buttonLabel: {
  },
});

export interface IDefaultActionRendererStyles {
  root?:   string;
  icon?:   string;
  label?:  string;
}

export interface IActionRenderTypeProps {
  label:      string;
  action:     ActionType;
  isDisabled: boolean;
  variant?:   ButtonProps['variant'];
  classes?:   IDefaultActionRendererStyles;
}

export type ActionRenderType = (props: IActionRenderTypeProps) => JSX.Element;
export const DefaultActionRenderer: ActionRenderType = ({label, action, isDisabled, variant, classes}: IActionRenderTypeProps) => (
  <Observe render={() => (
    <Button className={classes && classes.root} type={action.type} color={action.type ? 'primary' : action.color} variant={action.variant || variant} disabled={isDisabled || action.disabled()} onClick={action.action}>
      {action.icon && <Icon className={classes && classes.icon} style={{marginRight: '8px'}}>{action.icon}</Icon>}
      <span className={classes && classes.label}>{label}</span>
    </Button>
  )} />
);

const TRANSITION_TIMEOUT = 220;
const Transition = React.forwardRef((props: any, ref: any) => <Grow {...props} ref={ref} timeout={TRANSITION_TIMEOUT} onEntered={(node => node.style.transform = 'none')} />);

export interface IDialogProps {
  dialog                : Modal;
  classes?              : React.CSSProperties;
  fullWidth?            : boolean;
  fullScreen?           : boolean;
  disableEscapeKeyDown? : boolean;
  disableEnforceFocus?  : boolean;
  hideBackdrop?         : boolean;
  disableTransition?    : boolean;
  hasDivider?           : boolean;
  transition?           : (props: any) => JSX.Element;
  transitionDuration?   : number;
  title?                : (dialog: Modal) => JSX.Element;
  maxWidth?             : 'xs' | 'sm' | 'md' | 'lg' | false;
  buttonVariant?        : ButtonProps['variant'];
  ButtonRenderer?       : ActionRenderType;
}

type DialogProps = WithStyle<ReturnType<typeof styles>, IDialogProps>;

class DialogInternal extends React.Component<DialogProps> {
  prevActiveElement?: HTMLElement;

  componentDidMount() {
    disposeOnUnmount(this, () => {
      watch(() => this.props.dialog.isOpen, () => {
        if (this.props.dialog.isOpen) {
          this.prevActiveElement = document.activeElement as HTMLElement;
        } else if (this.prevActiveElement) {
          setTimeout(() => this.prevActiveElement && this.prevActiveElement.focus(), 0);
        }
      });
    });
  }

  renderDialogContent = React.memo(React.forwardRef((): JSX.Element => {
    const {classes, children, dialog, ButtonRenderer, title, buttonVariant} = this.props;
    const {buttonRoot, buttonIcon, buttonLabel} = classes;
    const buttonClasses                         = {root: buttonRoot, icon: buttonIcon, label: buttonLabel};
    const hasTitle                              = dialog.title || title;
    const hasActions                            = dialog.actions && Object.keys(dialog.actions).length > 0;
    const hasDivider                            = hasActions && !isNullOrUndefined(this.props.hasDivider) ? this.props.hasDivider : true;

    return (
      <Observe render={() => (
        < >
        {hasTitle &&
          <div className={classes.heading}>
            <Typography variant='h6'>{(title && title(dialog)) || dialog.title}</Typography>
            <hr/>
          </div>
        }
        <div className={classNames(classes.childrenContainer, hasActions && !hasDivider ? classes.childrenContainerActionsNoDivider : '')}>
          {children}
        </div>
        {hasDivider && <Divider className={classes.divider} />}
        {hasActions &&
          <div className={classes.buttons}>
            <Observe render={() => (
              Object.keys(dialog.actions).map(label => ((ButtonRenderer && <ButtonRenderer key={label} classes={buttonClasses} label={label} action={dialog.actions[label]} isDisabled={dialog.isDisabled} variant={buttonVariant} />) || <DefaultActionRenderer key={label} classes={buttonClasses} label={label} action={dialog.actions[label]} isDisabled={dialog.isDisabled} variant={buttonVariant} />))
            )} />
          </div>
        }
        </>
      )} />
    );
  }));

  render() {
    const {classes, dialog, fullWidth, fullScreen, maxWidth, disableEscapeKeyDown, hideBackdrop, transition, transitionDuration, disableTransition, disableEnforceFocus} = this.props;
    const escapeAction            = disableEscapeKeyDown ? undefined : () => dialog.close();
    const transitionToUse         = transition ? transition : Transition;
    const transitionDurationToUse = !isNullOrUndefined(transitionDuration) ? transitionDuration : TRANSITION_TIMEOUT;
    const transitionAction        = disableTransition ? undefined : transitionToUse;
    const transitionTime          = disableTransition ? 0 : transitionDurationToUse;

    return (
      <Observe render={() => (
        <Dialog classes={{paper: classes.root, paperScrollPaper: classes.scrollPaper}} open={dialog.isOpen} disableEnforceFocus={disableEnforceFocus} maxWidth={maxWidth} hideBackdrop={hideBackdrop} transitionDuration={transitionTime} TransitionComponent={transitionAction} fullWidth={fullWidth} fullScreen={fullScreen} disableEscapeKeyDown={disableEscapeKeyDown} onEscapeKeyDown={escapeAction}>
          <this.renderDialogContent />
        </Dialog>
      )} />
    );
  }
}

export default withStyles(styles, DialogInternal);
