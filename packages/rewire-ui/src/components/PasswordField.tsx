import * as React                    from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import InputAdornment                from '@material-ui/core/InputAdornment';
import IconButton                    from '@material-ui/core/IconButton';
import {Theme}                       from '@material-ui/core/styles';
import VisibilityIcon                from '@material-ui/icons/Visibility';
import VisibilityOffIcon             from '@material-ui/icons/VisibilityOff';
import BlurInputHOC                  from './BlurInputHOC';
import {TextAlignment, TextVariant}  from './editors';
import {withStyles, WithStyle}       from './styles';

const styles = (theme: Theme) => ({
  inputRoot: {
    lineHeight: 'inherit',
    fontSize: 'inherit',
  },
  formControlRoot: {
  },
  inputType: {
    height: 'auto',
  },
  iconButtonRoot: {
    color: 'inherit',
    fontSize: 'unset',
    padding: '0px',
    '&:hover, &:active': {
      backgroundColor: 'transparent',
      opacity: 1,
    },
  },
  inputAdornmentRoot: {
    height: 'auto',
    paddingBottom: '2px',
  },
  nativeInput: {
    '&::placeholder, &-webkit-input-::placeholder': {
      color: 'inherit',
      opacity: 0.4,
    },
  },
  helperTextRoot: {
    marginTop: '6px',
  },
  helperTextContained: {
    marginLeft: '14px',
    marginRight: '14px',
  },
});

export interface IPasswordFieldProps {
  visible?              : boolean;
  disabled?             : boolean;
  disableErrors?        : boolean;
  error?                : string;
  value?                : string;
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

export interface IPasswordFieldState {
  showPassword: boolean;
}

type PasswordFieldPropsStyled = WithStyle<ReturnType<typeof styles>, TextFieldProps & IPasswordFieldProps>;

class PasswordFieldInternal extends React.Component<PasswordFieldPropsStyled, IPasswordFieldState> {
  state: IPasswordFieldState = {
    showPassword: false,
  };

  constructor(props: PasswordFieldPropsStyled) {
    super(props);
  }

  shouldComponentUpdate(nextProps: PasswordFieldPropsStyled, nextState: IPasswordFieldState) {
    return (
      (nextProps.value !== this.props.value) ||
      (nextProps.disabled !== this.props.disabled) ||
      (nextProps.visible !== this.props.visible) ||
      (nextProps.error !== this.props.error) ||
      (nextState.showPassword !== this.state.showPassword) ||
      (nextProps.hasAdornment !== this.props.hasAdornment) ||
      (nextProps.label !== this.props.label) ||
      (nextProps.placeholder !== this.props.placeholder) ||
      (nextProps.align !== this.props.align) ||
      (nextProps.variant !== this.props.variant) ||
      (nextProps.disableErrors !== this.props.disableErrors)
    );
  }

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    } else if (this.props.cursorPositionOnFocus !== undefined) {
      let cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  handleClickShowPassword = () => {
    this.setState(state => ({showPassword: !state.showPassword}));
  }

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

    const type = this.state.showPassword ? 'text' : 'password';

    if (this.props.updateOnChange) {
      return (
        <TextField
          className={this.props.className}
          classes={{root: this.props.classes.formControlRoot}}
          type={type}
          disabled={this.props.disabled}
          label={this.props.label}
          placeholder={this.props.placeholder}
          variant={this.props.variant}
          error={!this.props.disableErrors && !this.props.disabled && !!this.props.error}
          helperText={!this.props.disableErrors && <span>{(!this.props.disabled && this.props.error) || ''}</span>}
          value={this.props.value}
          autoFocus={this.props.autoFocus}
          onFocus={this.handleFocus}
          onBlur={this.props.onBlur}
          onKeyDown={this.props.onKeyDown}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.value)}
          inputProps={{autoFocus: this.props.autoFocus, className: this.props.classes.nativeInput, style: {textAlign: this.props.align || 'left'}}}
          InputProps={{endAdornment: adornment, classes: {root: this.props.classes.inputRoot, inputType: this.props.classes.inputType}}}
          InputLabelProps={{shrink: true}}
          FormHelperTextProps={{classes: {root: this.props.classes.helperTextRoot, contained: this.props.classes.helperTextContained}}}
        />
      );
    }

    return (
      <BlurInputHOC {...this.props} type={type} onValueChange={this.props.onValueChange}
        render={(props: PasswordFieldPropsStyled) =>
          <TextField
            className={props.className}
            classes={{root: props.classes.formControlRoot}}
            type={type}
            disabled={props.disabled}
            label={props.label}
            placeholder={props.placeholder}
            variant={props.variant}
            error={!props.disableErrors && !props.disabled && !!props.error}
            helperText={!props.disableErrors && <span>{(!props.disabled && props.error) || ''}</span>}
            value={props.value}
            autoFocus={props.autoFocus}
            onFocus={this.handleFocus}
            onBlur={props.onBlur}
            onKeyDown={props.onKeyDown}
            onChange={props.onChange}
            inputProps={{autoFocus: props.autoFocus, className: props.classes.nativeInput, style: {textAlign: props.align || 'left'}}}
            InputProps={{endAdornment: adornment, classes: {root: props.classes.inputRoot, inputType: props.classes.inputType}}}
            InputLabelProps={{shrink: true}}
            FormHelperTextProps={{classes: {root: props.classes.helperTextRoot, contained: props.classes.helperTextContained}}}
          />
        }
      />
    );
  }
}

export default withStyles(styles, PasswordFieldInternal);
