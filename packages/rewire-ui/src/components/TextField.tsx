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
});

export interface ITextFieldProps {
  visible?         : boolean;
  disabled?        : boolean;
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
      (nextProps.error !== this.props.error)
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

    const startAdornment = this.props.startAdornment ? <InputAdornment position='start'>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment   = this.props.endAdornment ? <InputAdornment position='end'>{this.props.endAdornment}</InputAdornment> : undefined;

    if (this.props.updateOnChange) {
      return (
      <TextField
        className={this.props.className}
        classes={{root: this.props.classes.formControlRoot}}
        type={this.props.type}
        disabled={this.props.disabled}
        label={this.props.label}
        placeholder={this.props.placeholder}
        error={!this.props.disabled && !!this.props.error}
        helperText={!this.props.disabled && this.props.error}
        value={this.props.value}
        autoFocus={this.props.autoFocus}
        onFocus={this.handleFocus}
        onBlur={this.props.onBlur}
        onKeyDown={this.props.onKeyDown}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.value)}
        inputProps={{autoFocus: this.props.autoFocus, style: {textAlign: this.props.align || 'left'}}}
        InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: this.props.classes.inputRoot, inputType: this.props.classes.inputType}}}
        InputLabelProps={{shrink: true}}
      />);
    }

    return (
    <BlurInputHOC {...this.props} onValueChange={this.props.onValueChange}
      render={(props: TextFieldPropsStyled) =>
        <TextField
          className={props.className}
          classes={{root: props.classes.formControlRoot}}
          type={props.type}
          disabled={props.disabled}
          label={props.label}
          placeholder={props.placeholder}
          error={!props.disabled && !!props.error}
          helperText={!props.disabled && props.error}
          value={props.value}
          autoFocus={props.autoFocus}
          onFocus={this.handleFocus}
          onBlur={props.onBlur}
          onKeyDown={props.onKeyDown}
          onChange={props.onChange}
          inputProps={{autoFocus: props.autoFocus, style: {textAlign: props.align || 'left'}}}
          InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: props.classes.inputRoot, inputType: this.props.classes.inputType}}}
          InputLabelProps={{shrink: true}}
        />
      }
    />);
  }
}

export default withStyles(styles, TextFieldInternal);
