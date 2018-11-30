import * as React                    from 'react';
import NumberFormat                  from 'react-number-format';
import * as is                       from 'is';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import InputAdornment                from '@material-ui/core/InputAdornment';
import {Theme}                       from '@material-ui/core/styles';
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

export interface INumberFieldProps {
  visible?              : boolean;
  disabled?             : boolean;
  disableErrors?        : boolean;
  error?                : string;
  value?                : number;
  label?                : string;
  placeholder?          : string;
  format?               : string;
  mask?                 : string | string[];
  align?                : TextAlignment;
  decimals?             : number;
  fixed?                : boolean;
  thousandSeparator?    : boolean;
  updateOnChange?       : boolean;
  selectOnFocus?        : boolean;
  endOfTextOnFocus?     : boolean;
  cursorPositionOnFocus?: number;
  startAdornment?       : JSX.Element;
  endAdornment?         : JSX.Element;

  onValueChange: (value?: number) => void;
}

type NumberFieldProps = WithStyle<ReturnType<typeof styles>, TextFieldProps & INumberFieldProps>;

class NumberTextField extends React.Component<NumberFieldProps> {
  constructor(props: NumberFieldProps) {
    super(props);
  }

  handleValueChanged = (values: any) => {
    this.props.onValueChange(values.floatValue);
  }

  shouldComponentUpdate(nextProps: NumberFieldProps) {
    return (
      (nextProps.value !== this.props.value) ||
      (nextProps.disabled !== this.props.disabled) ||
      (nextProps.visible !== this.props.visible) ||
      (nextProps.format !== this.props.format) ||
      (nextProps.mask !== this.props.mask) ||
      (nextProps.decimals !== this.props.decimals) ||
      (nextProps.fixed !== this.props.fixed) ||
      (nextProps.error !== this.props.error) ||
      (nextProps.label !== this.props.label) ||
      (nextProps.placeholder !== this.props.placeholder) ||
      (nextProps.align !== this.props.align) ||
      (nextProps.variant !== this.props.variant) ||
      (nextProps.disableErrors !== this.props.disableErrors) ||
      (nextProps.startAdornment !== this.props.startAdornment) ||
      (nextProps.endAdornment !== this.props.endAdornment)
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
    let value            = this.parse(this.props.value);
    const startAdornment = this.props.startAdornment ? <InputAdornment position='start' classes={{root: this.props.classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment   = this.props.endAdornment ? <InputAdornment position='end' classes={{root: this.props.classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;

    if (updateOnChange) {
      return (
        <NumberFormat
          className={this.props.className}
          classes={{root: this.props.classes.formControlRoot}}
          disabled={this.props.disabled}
          error={!this.props.disableErrors && !this.props.disabled && !!this.props.error}
          value={value}
          label={this.props.label}
          onValueChange={this.handleValueChanged}
          onBlur={this.props.onBlur}
          autoFocus={this.props.autoFocus}
          onFocus={this.handleFocus}
          thousandSeparator={this.props.thousandSeparator || undefined}
          decimalScale={this.props.decimals}
          fixedDecimalScale={this.props.fixed}
          format={this.props.format}
          mask={this.props.mask}
          inputProps={{className: this.props.classes.nativeInput, style: {textAlign: this.props.align || 'left'}}}
          InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: this.props.classes.inputRoot}}}
          InputLabelProps={{shrink: true}}
          FormHelperTextProps={{classes: {root: this.props.classes.helperTextRoot, contained: this.props.classes.helperTextContained}}}
          customInput={TextField}
          placeholder={this.props.placeholder}
          variant={this.props.variant}
          helperText={!this.props.disableErrors && <span>{(!this.props.disabled && this.props.error) || ''}</span>}
        />);
    }

    return (
      <BlurInputHOC
        {...this.props}
        value={value}
        onValueChange={(v?: number) => this.props.onValueChange(v)}
        render={(props: NumberFieldProps) => (
          <NumberFormat
            className={props.className}
            classes={{root: props.classes.formControlRoot}}
            disabled={props.disabled}
            error={!props.disableErrors && !props.disabled && !!props.error}
            value={props.value}
            label={props.label}
            onValueChange={(values: any) => props.onChange && props.onChange({target: {value: values.floatValue}} as any)}
            onBlur={props.onBlur}
            autoFocus={props.autoFocus}
            onFocus={this.handleFocus}
            thousandSeparator={props.thousandSeparator || undefined}
            decimalScale={props.decimals}
            fixedDecimalScale={props.fixed}
            format={props.format}
            mask={props.mask}
            inputProps={{className: props.classes.nativeInput, style: {textAlign: props.align || 'left'}}}
            InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: props.classes.inputRoot}}}
            InputLabelProps={{shrink: true}}
            FormHelperTextProps={{classes: {root: props.classes.helperTextRoot, contained: props.classes.helperTextContained}}}
            customInput={TextField}
            placeholder={props.placeholder}
            variant={props.variant}
            helperText={!props.disableErrors && <span>{(!props.disabled && props.error) || ''}</span>}
          />)
        }
      />);
  }
}

export default withStyles(styles, NumberTextField);
