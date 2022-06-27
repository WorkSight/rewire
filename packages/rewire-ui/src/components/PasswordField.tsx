import * as React                    from 'react';
import classNames                    from 'classnames';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import InputAdornment                from '@material-ui/core/InputAdornment';
import IconButton                    from '@material-ui/core/IconButton';
import {Theme}                       from '@material-ui/core/styles';
import VisibilityIcon                from '@material-ui/icons/Visibility';
import VisibilityOffIcon             from '@material-ui/icons/VisibilityOff';
import {isNullOrUndefined}           from 'rewire-common';
import ErrorTooltip                  from './ErrorTooltip';
import BlurInputHOC                  from './BlurInputHOC';
import {TextAlignment, TextVariant}  from './editors';
import {withStyles, WithStyle}       from './styles';

const styles = (theme: Theme) => ({
  inputRoot: {
    lineHeight: 'inherit',
    fontSize: 'inherit',
  },
  inputInput: {
    paddingTop: '0.375em',
    paddingBottom: '0.4375em',
  },
  inputOutlinedInput: {
    paddingTop: '0.75em',
    paddingBottom: '0.75em',
  },
  inputLabelRoot: {
    fontSize: 'inherit',
  },
  inputLabelOutlined: {
    '&$inputLabelShrink': {
      transform: 'translate(14px, -0.375em) scale(0.75)',
    },
  },
  inputLabelShrink: {
  },
  inputFormControlWithLabel: {
    marginTop: '1em !important',
  },
  formControlRoot: {
  },
  iconButtonRoot: {
    color: 'inherit',
    fontSize: 'inherit',
    padding: '0px',
    '&:hover': {
      opacity: 0.7,
    },
  },
  inputAdornmentRoot: {
    height: 'auto',
    paddingBottom: '0.125em',
    '& svg': {
      fontSize: '1.5em',
    },
  },
  nativeInput: {
    '&::placeholder, &-webkit-input-::placeholder': {
      color: 'inherit',
      opacity: 0.4,
    },
  },
  helperTextRoot: {
    marginTop: '6px',
    fontSize: '0.8em',
  },
  helperTextRootErrorIcon: {
    fontSize: '1.2em',
  },
  helperTextContained: {
    marginLeft: '14px',
    marginRight: '14px',
  },
  errorIcon: {
  },
});

export type PasswordFieldStyles = ReturnType<typeof styles>;

export interface IPasswordFieldProps {
  visible?              : boolean;
  disabled?             : boolean;
  disableErrors?        : boolean;
  useTooltipForErrors?  : boolean;
  error?                : string;
  value?                : string;
  tooltip?              : string | ((value: any) => string)
  label?                : string;
  placeholder?          : string;
  align?                : TextAlignment;
  variant?              : TextVariant;
  selectOnFocus?        : boolean;
  endOfTextOnFocus?     : boolean;
  cursorPositionOnFocus?: number;
  updateOnChange?       : boolean;
  hasAdornment?         : boolean;

  onValueChange: (value?: string) => void;
}

export type PasswordFieldProps = WithStyle<PasswordFieldStyles, TextFieldProps & IPasswordFieldProps>;

export interface IPasswordFieldState {
  showPassword: boolean;
}

class PasswordField extends React.Component<PasswordFieldProps, IPasswordFieldState> {
  inputRef: React.RefObject<HTMLInputElement>;
  state: IPasswordFieldState = {
    showPassword: false,
  };

  constructor(props: PasswordFieldProps) {
    super(props);

    this.inputRef = React.createRef();
  }

  shouldComponentUpdate(nextProps: PasswordFieldProps, nextState: IPasswordFieldState) {
    return (
      (nextProps.value               !== this.props.value)               ||
      (nextProps.disabled            !== this.props.disabled)            ||
      (nextProps.visible             !== this.props.visible)             ||
      (nextProps.error               !== this.props.error)               ||
      (nextState.showPassword        !== this.state.showPassword)        ||
      (nextProps.hasAdornment        !== this.props.hasAdornment)        ||
      (nextProps.label               !== this.props.label)               ||
      (nextProps.placeholder         !== this.props.placeholder)         ||
      (nextProps.align               !== this.props.align)               ||
      (nextProps.variant             !== this.props.variant)             ||
      (nextProps.disableErrors       !== this.props.disableErrors)       ||
      (nextProps.useTooltipForErrors !== this.props.useTooltipForErrors) ||
      (nextProps.tooltip             !== this.props.tooltip)
    );
  }

  getTooltip(value: any): string | undefined {
    if (!this.state.showPassword) {
      return undefined;
    }
    let tooltip = this.props.tooltip;
    if (isNullOrUndefined(tooltip)) {
      return !isNullOrUndefined(value) ? String(value) : undefined;
    }
    if (is.function(tooltip))  {
      tooltip = (tooltip as CallableFunction)(value);
    }
    return tooltip as string;
  }

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    } else if (!isNullOrUndefined(this.props.cursorPositionOnFocus)) {
      let cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus!, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  handleClickShowPassword = () => {
    this.setState(state => ({showPassword: !state.showPassword}));
    setTimeout(() => this.inputRef.current && this.inputRef.current.focus(), 0);
  }

  renderError = React.memo((props: any) => {
    const {classes, error, useTooltipForErrors} = props;

    if (!useTooltipForErrors) {
      return error;
    }

    return (
      <ErrorTooltip
        inputRef={this.inputRef}
        error={error}
        classes={{errorIcon: classes.errorIcon}}
      />
    );
  });

  render() {
    if (this.props.visible === false) {
      return null;
    }

    let adornment = this.props.hasAdornment
      ? (
        <InputAdornment position='end' classes={{root: this.props.classes.inputAdornmentRoot}}>
          <IconButton tabIndex={-1} classes={{root: this.props.classes.iconButtonRoot}} disableRipple={true} onClick={this.handleClickShowPassword}>
            {this.state.showPassword
              ? <VisibilityOffIcon />
              : <VisibilityIcon />
            }
          </IconButton>
        </InputAdornment>
        )
      : undefined;

    const type                      = this.state.showPassword ? 'text' : 'password';
    const inputClassName            = this.props.variant === 'outlined' ? this.props.classes.inputOutlinedInput : this.props.classes.inputInput;
    const inputFormControlClassName = this.props.variant === 'standard' && this.props.label ? this.props.classes.inputFormControlWithLabel : undefined;
    let value                       = !isNullOrUndefined(this.props.value) ? this.props.value : '';

    if (this.props.updateOnChange) {
      return (
        <TextField
          className={this.props.className}
          classes={{root: this.props.classes.formControlRoot}}
          type={type}
          disabled={this.props.disabled}
          label={this.props.label}
          placeholder={this.props.placeholder}
          variant={this.props.variant as any}
          error={!this.props.disableErrors && !this.props.disabled && !!this.props.error}
          helperText={!this.props.disableErrors && <span>{(!this.props.disabled && this.props.error ? <this.renderError classes={this.props.classes} error={this.props.error} useTooltipForErrors={this.props.useTooltipForErrors} /> : '')}</span>}
          value={value}
          title={this.getTooltip(value)}
          inputRef={this.inputRef}
          autoFocus={this.props.autoFocus}
          onFocus={this.handleFocus}
          onBlur={this.props.onBlur}
          onKeyDown={this.props.onKeyDown}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.value)}
          inputProps={{spellCheck: false, className: this.props.classes.nativeInput, style: {textAlign: this.props.align || 'left'}}}
          InputProps={{endAdornment: adornment, classes: {root: this.props.classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
          InputLabelProps={{shrink: true, classes: {root: this.props.classes.inputLabelRoot, outlined: this.props.classes.inputLabelOutlined, shrink: this.props.classes.inputLabelShrink}}}
          FormHelperTextProps={{classes: {root: classNames(this.props.classes.helperTextRoot, this.props.useTooltipForErrors ? this.props.classes.helperTextRootErrorIcon : undefined), contained: this.props.classes.helperTextContained}}}
        />
      );
    }

    return (
      <BlurInputHOC {...(this.props as any)} type={type} value={value} onValueChange={this.props.onValueChange}
        render={(props: PasswordFieldProps) =>
          <TextField
            className={props.className}
            classes={{root: props.classes.formControlRoot}}
            type={type}
            disabled={props.disabled}
            label={props.label}
            placeholder={props.placeholder}
            variant={props.variant as any}
            error={!props.disableErrors && !props.disabled && !!props.error}
            helperText={!props.disableErrors && <span>{(!props.disabled && props.error ? <this.renderError classes={props.classes} error={props.error} useTooltipForErrors={props.useTooltipForErrors} /> : '')}</span>}
            value={props.value}
            title={this.getTooltip(props.value)}
            inputRef={this.inputRef}
            autoFocus={props.autoFocus}
            onFocus={this.handleFocus}
            onBlur={props.onBlur}
            onKeyDown={props.onKeyDown}
            onChange={props.onChange}
            inputProps={{spellCheck: false, className: props.classes.nativeInput, style: {textAlign: props.align || 'left'}}}
            InputProps={{endAdornment: adornment, classes: {root: props.classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
            InputLabelProps={{shrink: true, classes: {root: props.classes.inputLabelRoot, outlined: props.classes.inputLabelOutlined, shrink: props.classes.inputLabelShrink}}}
            FormHelperTextProps={{classes: {root: classNames(props.classes.helperTextRoot, props.useTooltipForErrors ? props.classes.helperTextRootErrorIcon : undefined), contained: props.classes.helperTextContained}}}
          />
        }
      />
    );
  }
}

export default withStyles(styles, PasswordField);
