import * as React                    from 'react';
import NumberFormat                  from 'react-number-format';
import * as is                       from 'is';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import BlurInputHOC                  from './BlurInputHOC';
import {TextAlignment}               from './editors';

export interface INumberFieldProps {
  visible?          : boolean;
  disabled?         : boolean;
  error?            : string;
  value?            : number;
  label?            : string;
  placeholder?      : string;
  format?           : string;
  mask?             : string | string[];
  align?            : TextAlignment;
  decimals?         : number;
  fixed?            : boolean;
  thousandSeparator?: boolean;
  updateOnChange?   : boolean;
  selectOnFocus?    : boolean;
  endOfTextOnFocus? : boolean;
  onValueChange     : (value?: number) => void;
}

export default class NumberTextField extends React.Component<TextFieldProps & INumberFieldProps> {
  constructor(props: TextFieldProps & INumberFieldProps) {
    super(props);
  }

  handleValueChanged = (values: any) => {
    this.props.onValueChange(values.floatValue);
  }

  shouldComponentUpdate(nextProps: INumberFieldProps) {
    return (nextProps.value !== this.props.value);
  }

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    }
  }

  parse(v: any) {
    if (is.string(v) && (v.length > 0)) {
      return parseFloat(v);
    }
    return v;
  }

  render(): any {
    const {visible, updateOnChange} = this.props;
    if (visible === false) {
      return null;
    }
    let value = this.parse(this.props.value);

    if (updateOnChange) {
      return (
        <NumberFormat
          disabled={this.props.disabled}
          error={this.props.error}
          value={value}
          label={this.props.label}
          onValueChange={this.handleValueChanged}
          onBlur={this.props.onBlur}
          autoFocus={this.props.autoFocus}
          onFocus={this.handleFocus}
          thousandSeparator={this.props.thousandSeparator}
          prefix='$'
          decimalScale={this.props.decimals}
          inputProps={{style: {textAlign: this.props.align || 'left'}}}
          InputLabelProps={{shrink: true}}
          fixedDecimalScale={this.props.fixed}
          customInput={TextField}
          placeholder={this.props.placeholder}
          helperText={!this.props.disabled && this.props.error}
        />);
    }

    return (
      <BlurInputHOC
        {...this.props}
        value={value}
        onValueChange={(v?: number) => this.props.onValueChange(v)}
        render={(props: TextFieldProps & INumberFieldProps) => (
          <NumberFormat
            disabled={props.disabled}
            error={props.error}
            value={props.value}
            label={props.label}
            onValueChange={(values: any) => props.onChange && props.onChange({target: {value: values.floatValue}} as any)}
            onBlur={props.onBlur}
            onFocus={this.handleFocus}
            autoFocus={props.autoFocus}
            thousandSeparator={props.thousandSeparator}
            decimalScale={props.decimals}
            inputProps={{style: {textAlign: props.align || 'left'}}}
            InputLabelProps={{shrink: true}}
            fixedDecimalScale={props.fixed}
            customInput={TextField}
            placeholder={props.placeholder}
            helperText={!props.disabled && props.error}
          />)
        }
      />);
  }
}
