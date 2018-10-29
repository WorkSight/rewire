import * as React                    from 'react';
import BlurInputHOC                  from './BlurInputHOC';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import InputAdornment                from '@material-ui/core/InputAdornment';
import {Theme}                       from '@material-ui/core/styles';
import {TextAlignment}               from './editors';
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
  inputAdornmentRoot: {
    height: 'auto',
    paddingBottom: '2px',
  },
  nativeInput: {
    '&::placeholder, &-webkit-input-::placeholder': {
      color: 'inherit',
      opacity: 0.4,
    },
    '&[type=date]': {
      padding: '4px 0px 4px 0px',
      '&::-webkit-clear-button': {
        marginRight: '4px',
      },
      '&::-webkit-inner-spin-button': {
        // '-webkit-appearance': 'none',
        marginRight: '1px',
      },
      '&::-webkit-calendar-picker-indicator': {
        marginTop: '2px',
        fontSize: '1.1em',
      },
    },
  },
});

export interface ITextFieldProps {
  visible?         : boolean;
  disabled?        : boolean;
  disableErrors?   : boolean;
  error?           : string;
  value?           : string;
  label?           : string;
  placeholder?     : string;
  align?           : TextAlignment;
  selectOnFocus?   : boolean;
  endOfTextOnFocus?: boolean;
  updateOnChange?  : boolean;
  startAdornment?  : JSX.Element;
  endAdornment?    : JSX.Element;

  onValueChange: (value?: string) => void;
}

type TextFieldPropsStyled = WithStyle<ReturnType<typeof styles>, TextFieldProps & ITextFieldProps>;

class TextFieldInternal extends React.Component<TextFieldPropsStyled> {
  constructor(props: TextFieldPropsStyled) {
    super(props);
  }

  shouldComponentUpdate(nextProps: TextFieldPropsStyled) {
    return (
      (nextProps.value !== this.props.value) ||
      (nextProps.disabled !== this.props.disabled) ||
      (nextProps.visible !== this.props.visible) ||
      (nextProps.error !== this.props.error) ||
      (nextProps.label !== this.props.label) ||
      (nextProps.placeholder !== this.props.placeholder) ||
      (nextProps.align !== this.props.align) ||
      (nextProps.disableErrors !== this.props.disableErrors) ||
      (nextProps.startAdornment !== this.props.startAdornment) ||
      (nextProps.endAdornment !== this.props.endAdornment)
    );
  }

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.type === 'date' && (this.props.selectOnFocus || this.props.endOfTextOnFocus)) {
      evt.target.select();
    } else if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    }
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    const {classes, type} = this.props;

    const startAdornment = this.props.startAdornment ? <InputAdornment position='start' classes={{root: classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment   = this.props.endAdornment ? <InputAdornment position='end' classes={{root: classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;

    if (this.props.updateOnChange) {
      return (
      <TextField
        className={this.props.className}
        classes={{root: classes.formControlRoot}}
        type={type}
        disabled={this.props.disabled}
        label={this.props.label}
        placeholder={this.props.placeholder}
        error={!this.props.disableErrors && !this.props.disabled && !!this.props.error}
        helperText={!this.props.disableErrors && <span>{(!this.props.disabled && this.props.error) || ''}</span>}
        value={this.props.value}
        autoFocus={this.props.autoFocus}
        onFocus={this.handleFocus}
        onBlur={this.props.onBlur}
        onKeyDown={this.props.onKeyDown}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.value)}
        inputProps={{autoFocus: this.props.autoFocus, className: classes.nativeInput, style: {textAlign: this.props.align || 'left'}}}
        InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, inputType: classes.inputType}}}
        InputLabelProps={{shrink: true}}
      />);
    }

    return (
    <BlurInputHOC {...this.props} onValueChange={this.props.onValueChange}
      render={(props: TextFieldPropsStyled) =>
        <TextField
          className={props.className}
          classes={{root: classes.formControlRoot}}
          type={type}
          disabled={props.disabled}
          label={props.label}
          placeholder={props.placeholder}
          error={!props.disableErrors && !props.disabled && !!props.error}
          helperText={!props.disableErrors && <span>{(!props.disabled && props.error) || ''}</span>}
          value={props.value}
          autoFocus={props.autoFocus}
          onFocus={this.handleFocus}
          onBlur={props.onBlur}
          onKeyDown={props.onKeyDown}
          onChange={props.onChange}
          inputProps={{autoFocus: props.autoFocus, className: classes.nativeInput, style: {textAlign: props.align || 'left'}}}
          InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, inputType: classes.inputType}}}
          InputLabelProps={{shrink: true}}
        />
      }
    />);
  }
}

export default withStyles(styles, TextFieldInternal);
