import * as React                    from 'react';
import BlurInputHOC                  from './BlurInputHOC';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import {Theme}                       from '@material-ui/core/styles';
import {TextAlignment}               from './editors';
import {withStyles, WithStyle}       from './styles';

const styles = (theme: Theme) => ({
  inputRoot: {
    lineHeight: 'inherit',
    fontSize: 'inherit',
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
  onValueChange    : (value?: string) => void;
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
    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    }
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    if (this.props.updateOnChange) {
      return (
      <TextField
        className={this.props.className}
        autoFocus={this.props.autoFocus}
        disabled={this.props.disabled}
        label={this.props.label}
        inputProps={{autoFocus: this.props.autoFocus, style: {textAlign: this.props.align || 'left'}}}
        placeholder={this.props.placeholder}
        error={!this.props.disabled && !!this.props.error}
        helperText={!this.props.disabled && this.props.error}
        value={this.props.value}
        onFocus={this.handleFocus}
        onBlur={this.props.onBlur}
        onKeyDown={this.props.onKeyDown}
        type={this.props.type}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.value)}
        InputProps={{startAdornment: this.props.startAdornment, endAdornment: this.props.endAdornment, classes: {root: this.props.classes.inputRoot}}}
        InputLabelProps={{shrink: true}}
      />);
    }

    return (
    <BlurInputHOC {...this.props} onValueChange={this.props.onValueChange}
      render={(props: TextFieldPropsStyled) =>
        <TextField
          className={this.props.className}
          type={this.props.type}
          disabled={props.disabled}
          label={props.label}
          onFocus={this.handleFocus}
          autoFocus={props.autoFocus}
          placeholder={props.placeholder}
          error={!props.disabled && !!props.error}
          helperText={!props.disabled && props.error}
          value={props.value}
          onBlur={props.onBlur}
          onKeyDown={props.onKeyDown}
          onChange={props.onChange}
          inputProps={{autoFocus: props.autoFocus, style: {textAlign: this.props.align || 'left'}}}
          InputProps={{startAdornment: props.startAdornment, endAdornment: props.endAdornment, classes: {root: props.classes.inputRoot}}}
          InputLabelProps={{shrink: true}}
        />
      }
    />);
  }
}

export default withStyles(styles, TextFieldInternal);
