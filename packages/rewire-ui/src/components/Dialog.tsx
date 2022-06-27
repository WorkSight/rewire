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
import { PaperProps }            from '@material-ui/core/Paper';
import { Theme }                 from '@material-ui/core/styles';
import { WithStyle, withStyles } from './styles';
import { TransitionProps }       from '@material-ui/core/transitions';
import './Dialog.css';

type TransitionPropsType = React.ComponentType<TransitionProps & { children?: React.ReactElement<any, any> }> | undefined;

let styles = (theme: Theme) => ({
  root: {
    width: '100%',
    overflowY: 'hidden',
  },
  container: {
  },
  scrollPaper: {
    maxHeight: 'calc(100% - 72px)',
  },
  paperWidthFalse: {
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
    padding: '15px 15px 0px 15px',
    margin: '0px',
    '& > hr': {
      marginTop: '15px',
      marginBottom: '0px',
      width: '85%',
      border: '1px solid #eee'
    },
  },
  childrenContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    margin: '1px 0px',
    paddingTop: '15px',
    paddingBottom: '15px',
    position: 'relative',
    width: '100%',
    height: '100%',
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

export type DialogStyles = ReturnType<typeof styles>;

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

export interface HeaderComponentProps {
  dialog: Modal;
  classes?: any;
  title?: (dialog: Modal) => JSX.Element;
}

export interface IDialogProps {
  dialog                : Modal;
  classes?              : any;
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
  actions?              : string[];
  ButtonRenderer?       : ActionRenderType;
  PaperComponent?       : React.ElementType<PaperProps>;
  HeaderComponent?      : (props: any) => JSX.Element;
}

export type DialogProps = WithStyle<DialogStyles, IDialogProps>;

class DialogInternal extends React.Component<IDialogProps> {
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

  RenderHeader(props: HeaderComponentProps): JSX.Element {
    const {dialog, classes, title} = props;
    const hasTitle                 = dialog.title || title;

    return (
      <Observe render={() => (
        hasTitle &&
          <div className={classes.heading}>
            <Typography variant='h6'>{(title && title(dialog)) || dialog.title}</Typography>
            <hr/>
          </div>
      )} />
    );
  }

  RenderDialogContent = React.memo(React.forwardRef((): JSX.Element => {
    const {classes, children, dialog, ButtonRenderer, buttonVariant, title, HeaderComponent} = this.props;
    const {buttonRoot, buttonIcon, buttonLabel} = classes;
    const buttonClasses                         = {root: buttonRoot, icon: buttonIcon, label: buttonLabel};
    const actions                               = this.props.actions || (dialog.actions && Object.keys(dialog.actions));
    const hasActions                            = actions && (actions.length > 0);
    const hasDivider                            = hasActions && !isNullOrUndefined(this.props.hasDivider) ? this.props.hasDivider : true;
    const HeaderRenderer                        = React.memo(HeaderComponent ?? this.RenderHeader);

    return (
      <Observe render={() => (
        < >
        <HeaderRenderer dialog={dialog} classes={classes} title={title} />
        <div className={classNames(classes.childrenContainer, hasActions && !hasDivider ? classes.childrenContainerActionsNoDivider : '')}>
          {children}
        </div>
        {hasDivider && <Divider className={classes.divider} />}
        {hasActions &&
          <div className={classes.buttons}>
            <Observe render={() => (
              actions.map(label => ((ButtonRenderer && <ButtonRenderer key={label} classes={buttonClasses} label={label} action={dialog.actions[label]} isDisabled={dialog.isDisabled} variant={buttonVariant} />) || <DefaultActionRenderer key={label} classes={buttonClasses} label={label} action={dialog.actions[label]} isDisabled={dialog.isDisabled} variant={buttonVariant} />))
            )} />
          </div>
        }
        </>
      )} />
    );
  }));

  render() {
    const {classes, dialog, fullWidth, fullScreen, maxWidth, disableEscapeKeyDown, hideBackdrop, transition, transitionDuration, disableTransition, disableEnforceFocus, PaperComponent} = this.props;
    const escapeAction            = disableEscapeKeyDown ? undefined : () => dialog.close();
    const transitionToUse         = transition ? transition : Transition;
    const transitionDurationToUse = !isNullOrUndefined(transitionDuration) ? transitionDuration : TRANSITION_TIMEOUT;
    const transitionAction        = (disableTransition ? undefined : transitionToUse) as TransitionPropsType;
    const transitionTime          = disableTransition ? 0 : transitionDurationToUse;

    return (
      <Observe render={() => (
        <Dialog classes={{container: classes.container, paper: classes.root, paperScrollPaper: classes.scrollPaper, paperWidthFalse: classes.paperWidthFalse}} open={dialog.isOpen} disableEnforceFocus={disableEnforceFocus} maxWidth={maxWidth} hideBackdrop={hideBackdrop} transitionDuration={transitionTime} TransitionComponent={transitionAction} PaperComponent={PaperComponent} fullWidth={fullWidth} fullScreen={fullScreen} disableEscapeKeyDown={disableEscapeKeyDown} onEscapeKeyDown={escapeAction}>
          <this.RenderDialogContent />
        </Dialog>
      )} />
    );
  }
}

export default withStyles(styles, DialogInternal);
