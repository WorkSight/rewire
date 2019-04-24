import * as React                      from 'react';
import ColorPickerDialog, {IColor}     from './ColorPickerDialog';
import classNames                      from 'classnames';
import {TextVariant}                   from './editors';
import RootRef                         from '@material-ui/core/RootRef';
import InputLabel                      from '@material-ui/core/InputLabel';
import IconButton                      from '@material-ui/core/IconButton';
import FormControl                     from '@material-ui/core/FormControl';
import {Theme}                         from '@material-ui/core/styles';
import {withStyles, WithStyle}         from './styles';

const styles = (theme: Theme) => ({
  formControlRoot: {
    marginLeft: '0px',
    alignItems: 'flex-start',
  },
  inputLabelRoot: {
    fontSize: 'inherit',
  },
  inputLabelOutlined: {
    '&$inputLabelShrink': {
      transform: 'translate(0, -0.375em) scale(0.75)',
    },
  },
  inputLabelShrink: {
  },
  colorFieldContainerNoLabel: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  colorPickerTrigger: {
    width: '2.5em',
    height: '1.75em',
    fontSize: '1em',
    marginTop: '1.3em',
    border: '1px solid #999',
    display: 'flex',
    borderRadius: '2px',
    padding: '2px',
    boxShadow: '0 0 0 2px #fff inset',
    '&.disabled': {
      cursor: 'default',
    }
  },
  colorPickerTriggerOutlined: {
    marginTop: '0.85em',
  },
  colorPickerTriggerRipple: {
    top: '-20%',
    left: '-30%',
    width: '160%',
    height: '140%',
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

  onValueChange: (value?: string) => void;
}

export interface IColorFieldState {
  open: boolean;
  color?: string;
}

type ColorFieldPropsStyled = WithStyle<ReturnType<typeof styles>, IColorFieldProps>;

class ColorField extends React.Component<ColorFieldPropsStyled, IColorFieldState> {
  state: IColorFieldState;
  inputLabelRef: React.RefObject<HTMLElement>;
  colorPickerTriggerRef: React.RefObject<HTMLElement>;
  colorPickerPanelContainerRef: React.RefObject<HTMLDivElement>;
  triggerElementActions: any;

  constructor(props: ColorFieldPropsStyled) {
    super(props);

    this.state = {
      open: false,
      color: props.value,
    };

    this.colorPickerTriggerRef        = React.createRef();
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

  handleChangeComplete = (color: IColor, evt: React.ChangeEvent<any>) => {
    this.setState({color: color.hex});
  }

  handleOpen = () => {
    this.setState({open: true});
  }

  handleClose = (evt: object, reason: 'escapeKeyDown' | 'backdropClick') => {
    this.focusColorPickerTrigger();
    this.setState({open: false}, () => {
      if (reason === 'escapeKeyDown') {
        this.setState({color: this.props.value});
      } else {
        // backdrop click
        this.props.onValueChange(this.state.color);
      }
    });
  }

  handleKeyDown = (evt: React.KeyboardEvent<any>) => {
    switch (evt.key) {
      case 'Enter':
        if (!this.state.open) return;
        if (evt.repeat) break;
        this.handleClose(evt, 'backdropClick');
      case ' ':
        if (evt.repeat) break;
        if (this.state.open) {
          this.handleClose(evt, 'backdropClick');
        } else {
          this.handleOpen();
        }
        break;
      case 'Escape':
        if (!this.state.open) return;
        if (evt.repeat) break;
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
  }

  focusColorPickerTrigger() {
    let element = this.getTriggerElement();
    element && element.focus();
    this.triggerElementActions && this.triggerElementActions.focusVisible();
  }

  getTriggerElement = (): HTMLElement | null => {
    return this.colorPickerTriggerRef.current;
  }

  getPickerContainerElement = (): HTMLElement | null => {
    return this.colorPickerPanelContainerRef.current;
  }

  renderColorPickerTrigger(): JSX.Element {
    const {classes, disabled, autoFocus, variant, value} = this.props;

    return (
      <RootRef rootRef={this.colorPickerTriggerRef}>
        <IconButton
          className={classNames('rc-color-picker-trigger', variant === 'outlined' ? classes.colorPickerTriggerOutlined : '')}
          classes={{root: classes.colorPickerTrigger}}
          disabled={disabled}
          style={{backgroundColor: value, borderColor: disabled ? 'rgba(0, 0, 0, 0.26)' : ''}}
          action={(actions: any) => {
            this.triggerElementActions = actions;
            autoFocus && actions.focusVisible();
          }}
          onClick={!disabled ? this.handleOpen : undefined}
          TouchRippleProps={{classes: {root: classes.colorPickerTriggerRipple}}}
        >
        </IconButton>
      </RootRef>
    );
  }

  renderColorPicker(value: string): JSX.Element {
    const {className} = this.props;

    return (
      <div ref={this.colorPickerPanelContainerRef}>
        <ColorPickerDialog
          className={className}
          color={value}
          disableAlpha={true}
          isOpen={this.state.open}
          anchorEl={this.getPickerContainerElement}
          onClose={this.handleClose}
          onChangeComplete={this.handleChangeComplete}
        />
        {this.renderColorPickerTrigger()}
      </div>
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
        {label && <InputLabel htmlFor='rc-color-picker-trigger' shrink={true} variant={variant} classes={{root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}>{label}</InputLabel>}
        {this.renderColorPicker(value)}
      </FormControl>
    );
  }
}

export default withStyles(styles, ColorField);
