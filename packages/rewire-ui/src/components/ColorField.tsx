import * as React                      from 'react';
import * as ColorPicker                from 'rc-color-picker';
import classNames                      from 'classnames';
import {TextVariant}                   from './editors';
import RootRef                         from '@material-ui/core/RootRef';
import InputLabel                      from '@material-ui/core/InputLabel';
import IconButton                      from '@material-ui/core/IconButton';
import FormControl                     from '@material-ui/core/FormControl';
import {Theme}                         from '@material-ui/core/styles';
import {withStyles, WithStyle}         from './styles';
import 'rc-color-picker/assets/index.css';

const styles = (theme: Theme) => ({
  formControlRoot: {
    marginLeft: '0px',
    alignItems: 'flex-start',
  },
  inputLabelRoot: {
    fontSize: 'inherit',
  },
  inputLabelRootShrink: {
    transform: 'translate(0, -0.375em) scale(0.75) !important',
  },
  colorFieldContainerNoLabel: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  colorPickerTrigger: {
    width: '1.5em',
    height: '1.5em',
    fontSize: '1em',
    marginTop: '1.5em',
    padding: '2px',
    border: '1px solid #999',
    display: 'inline-block',
    borderRadius: '2px',
    '&.disabled': {
      cursor: 'default',
    }
  },
  colorPickerTriggerOutlined: {
    marginTop: '1em',
  },
  colorPickerPanelContainer: {
    position: 'fixed',
    zIndex: '1300',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  colorPickerPanelContainerClosed: {
    visibility: 'hidden',
  },
  colorPickerTriggerRipple: {
    top: '-30%',
    left: '-30%',
    width: '160%',
    height: '160%',
  },
});

export interface IColorFieldProps {
  className?       : string;
  autoFocus?       : boolean;
  visible?         : boolean;
  disabled?        : boolean;
  value?           : string;
  variant?         : TextVariant;
  label?           : string;
  updateOnChange?  : boolean;

  onValueChange: (value?: string) => void;
}

export interface IColorFieldState {
  open: boolean;
}

type ColorFieldPropsStyled = WithStyle<ReturnType<typeof styles>, IColorFieldProps>;

class ColorField extends React.Component<ColorFieldPropsStyled, IColorFieldState> {
  state: IColorFieldState;
  inputLabelRef: React.RefObject<HTMLElement>;
  colorPickerRef: React.RefObject<HTMLElement>;
  colorPickerPanelContainerRef: React.RefObject<HTMLDivElement>;
  triggerElementActions: any;
  exitingWithoutSave: boolean;
  keyDown: boolean;

  constructor(props: ColorFieldPropsStyled) {
    super(props);

    this.state = {
      open: false,
    };
    this.exitingWithoutSave           = false;
    this.keyDown                      = false;
    this.colorPickerRef               = React.createRef();
    this.colorPickerPanelContainerRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      this.focusColorPickerTrigger();
    }
  }

  shouldComponentUpdate(nextProps: ColorFieldPropsStyled, nextState: IColorFieldState) {
    return (
      (nextProps.value !== this.props.value) ||
      (nextProps.disabled !== this.props.disabled) ||
      (nextProps.visible !== this.props.visible) ||
      (nextProps.label !== this.props.label) ||
      (nextProps.variant !== this.props.variant) ||
      (nextState.open !== this.state.open)
    );
  }

  handleOpen = () => {
    this.setState({open: true});
  }

  handleClose = (colors: any) => {
    this.setState({open: false}, () => {
      if (this.exitingWithoutSave) {
        this.exitingWithoutSave = false;
        this.forceUpdate();
      } else {
        this.props.onValueChange(colors.color);
      }
    });
  }

  handleKeyDown = (evt: React.KeyboardEvent<any>) => {
    let panelElement = evt.target as HTMLElement;

    switch (evt.key) {
      case 'Enter':
        if (this.keyDown || evt.repeat) break;
        this.keyDown = true;
        this.focusColorPickerTrigger();
      case ' ':
        if (this.keyDown || evt.repeat) break;
        this.keyDown = true;
        if (this.state.open) {
          this.focusColorPickerTrigger();
        } else {
          this.getTriggerElement().click();
        }
        break;
      case 'Escape':
        if (this.keyDown || evt.repeat) break;
        this.exitingWithoutSave = true;
        this.keyDown            = true;
        this.focusColorPickerTrigger();
        break;
      default:
        return;
    }

    evt.stopPropagation();
    evt.preventDefault();
  }

  handleKeyUp = (evt: React.KeyboardEvent<any>) => {
    switch (evt.key) {
      case 'Enter':
      case ' ':
      case 'Escape':
        evt.stopPropagation();
        evt.preventDefault();
    }

    this.keyDown = false;
  }

  focusColorPickerTrigger() {
    let element = this.getTriggerElement();
    element && element.focus();
    this.triggerElementActions && this.triggerElementActions.focusVisible();
  }

  getTriggerElement = (): HTMLButtonElement | null => {
    return this.colorPickerRef.current && (this.colorPickerRef.current.querySelector('.rc-color-picker-trigger') as HTMLButtonElement);
  }

  getPickerContainerElement = (): HTMLDivElement | null => {
    return this.colorPickerPanelContainerRef.current;
  }

  renderColorPickerTrigger(value: string): JSX.Element {
    const {classes, disabled, autoFocus, variant} = this.props;

    return (
      <IconButton
        className={classNames('rc-color-picker-trigger', classes.colorPickerTrigger, variant === 'outlined' ? classes.colorPickerTriggerOutlined : '', disabled ? 'disabled' : '')}
        tabIndex={disabled ? undefined : 0}
        style={{backgroundColor: value}}
        action={(actions: any) => {
          this.triggerElementActions = actions;
          autoFocus && actions.focusVisible();
        }}
        TouchRippleProps={{classes: {root: classes.colorPickerTriggerRipple}}}
      >
      </IconButton>
    );
  }

  renderColorPicker(value: string): JSX.Element {
    const {classes} = this.props;

    return (
      < >
      <div className={classNames(classes.colorPickerPanelContainer, !this.state.open ? classes.colorPickerPanelContainerClosed : '')} ref={this.colorPickerPanelContainerRef}></div>
      {this.props.disabled
        ? this.renderColorPickerTrigger(value)
        : <RootRef rootRef={this.colorPickerRef}>
            <ColorPicker
              className={this.props.className}
              color={value}
              enableAlpha={false}
              getCalendarContainer={this.getPickerContainerElement}
              onOpen={this.handleOpen}
              onClose={this.handleClose}
            >
              {this.renderColorPickerTrigger(value)}
            </ColorPicker>
          </RootRef>
      }
      </>
    );
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    const {classes, label, variant} = this.props;
    let value = this.props.value !== undefined && this.props.value !== null ? this.props.value : '#fff';

    return (
      <FormControl
        className={this.props.className}
        classes={{root: classes.formControlRoot}}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
      >
        {label && <InputLabel htmlFor='rc-color-picker-trigger' shrink={true} variant={variant} classes={{root: classes.inputLabelRoot, outlined: classes.inputLabelRootShrink}}>{label}</InputLabel>}
        {this.renderColorPicker(value)}
      </FormControl>
    );
  }
}

export default withStyles(styles, ColorField);
