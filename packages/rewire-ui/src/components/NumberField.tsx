import React                                from 'react';
import _NumberFormat, { NumberFormatProps } from 'react-number-format';
import is                                   from 'is';
import classNames                           from 'classnames';
import TextField, { TextFieldProps }        from '@material-ui/core/TextField';
import InputAdornment                       from '@material-ui/core/InputAdornment';
import { Theme }                            from '@material-ui/core/styles';
import { isNullOrUndefined }                from 'rewire-common';
import ErrorTooltip                         from './ErrorTooltip';
import BlurInputHOC                         from './BlurInputHOC';
import { TextAlignment }                    from './editors';
import { withStyles, WithStyle }            from './styles';

const styles = (_theme: Theme) => ({
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

export type NumberFieldStyles = ReturnType<typeof styles>;

export interface INumberFieldProps {
  visible?              : boolean;
  disabled?             : boolean;
  disableErrors?        : boolean;
  useTooltipForErrors?  : boolean;
  error?                : string;
  value?                : number;
  tooltip?              : string | ((value: any) => string);
  label?                : string;
  placeholder?          : string;
  format?               : string;
  mask?                 : string | string[];
  align?                : TextAlignment;
  decimals?             : number;
  fixed?                : boolean;
  isNumericString?      : boolean;
  thousandSeparator?    : boolean;
  allowNegative?        : boolean;
  updateOnChange?       : boolean;
  selectOnFocus?        : boolean;
  endOfTextOnFocus?     : boolean;
  cursorPositionOnFocus?: number;
  startAdornment?       : JSX.Element;
  endAdornment?         : JSX.Element;

  isAllowed?: (values: any) => boolean;
  onValueChange: (value?: number | string) => void;
}

export type NumberFieldProps = WithStyle<NumberFieldStyles, TextFieldProps & INumberFieldProps>;

const NumberFormat = _NumberFormat as unknown as (props: (NumberFormatProps<TextFieldProps> & NumberFieldProps)) => JSX.Element;

class NumberTextField extends React.Component<NumberFieldProps> {
  inputRef: React.RefObject<HTMLInputElement>;

  constructor(props: NumberFieldProps) {
    super(props);

    this.inputRef = React.createRef();
  }

  handleValueChanged = (values: any) => {
    const value = values.floatValue;
    this.props.onValueChange(value);
  };

  shouldComponentUpdate(nextProps: NumberFieldProps) {
    return (
      (nextProps.value               !== this.props.value)               ||
      (nextProps.disabled            !== this.props.disabled)            ||
      (nextProps.visible             !== this.props.visible)             ||
      (nextProps.format              !== this.props.format)              ||
      (nextProps.mask                !== this.props.mask)                ||
      (nextProps.decimals            !== this.props.decimals)            ||
      (nextProps.thousandSeparator   !== this.props.thousandSeparator)   ||
      (nextProps.allowNegative       !== this.props.allowNegative)       ||
      (nextProps.isAllowed           !== this.props.isAllowed)           ||
      (nextProps.fixed               !== this.props.fixed)               ||
      (nextProps.error               !== this.props.error)               ||
      (nextProps.label               !== this.props.label)               ||
      (nextProps.placeholder         !== this.props.placeholder)         ||
      (nextProps.align               !== this.props.align)               ||
      (nextProps.variant             !== this.props.variant)             ||
      (nextProps.disableErrors       !== this.props.disableErrors)       ||
      (nextProps.useTooltipForErrors !== this.props.useTooltipForErrors) ||
      (nextProps.startAdornment      !== this.props.startAdornment)      ||
      (nextProps.endAdornment        !== this.props.endAdornment)        ||
      (nextProps.tooltip             !== this.props.tooltip)
    );
  }

  getTooltip(value: any): string | undefined {
    let tooltip = this.props.tooltip;
    if (isNullOrUndefined(tooltip)) {
      return !isNullOrUndefined(value) ? this.getNumberString(value, this.props.decimals, this.props.thousandSeparator, this.props.fixed) : undefined;
    }
    if (is.function(tooltip))  {
      tooltip = (tooltip as CallableFunction)(value);
    }
    return tooltip as string;
  }

  getNumberString(value: any, decimals?: number, thousandSeparator?: boolean, fixed?: boolean): string | undefined {
    if (isNullOrUndefined(value)) return value ?? undefined;

    let numberStr = decimals && is.number(value) ? value.toFixed(decimals) : value.toString();
    if (!fixed) {
      numberStr = parseFloat(numberStr).toString();
    }
    numberStr = thousandSeparator ? this.getThousandSeparatedNumberString(numberStr) : numberStr;

    return numberStr;
  }

  splitDecimal(numStr: string): any {
    const hasNagation = numStr[0] === '-';
    const addNegation = hasNagation;
    numStr            = numStr.replace('-', '');

    const parts         = numStr.split('.');
    const beforeDecimal = parts[0];
    const afterDecimal  = parts[1] || '';

    return {
      beforeDecimal,
      afterDecimal,
      addNegation,
    };
  }

  getThousandSeparatedNumberString(numStr: string): string {
    // eslint-disable-next-line prefer-const
    let {beforeDecimal, afterDecimal, addNegation} = this.splitDecimal(numStr);
    const hasDecimalSeparator = !!afterDecimal && afterDecimal.length > 0;

    beforeDecimal = beforeDecimal.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + ',');

    if (addNegation) beforeDecimal = '-' + beforeDecimal;

    return beforeDecimal + (hasDecimalSeparator ? '.' : '') + afterDecimal;
  }

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if ((this.props.value as unknown as string) === '.') {
      evt.target.setSelectionRange(2, 2);
      return;
    }
    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    } else if (!isNullOrUndefined(this.props.cursorPositionOnFocus)) {
      const cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus!, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }
  };

  parse(v: any) {
    if (is.string(v) && (v.length > 0)) {
      return parseFloat(v);
    }
    return v;
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

  TextFieldWithErrorProp = (props: TextFieldProps) => <TextField error={!this.props.disableErrors && !this.props.disabled && !!this.props.error} {...props} />;

  render(): any {
    const {visible, updateOnChange} = this.props;
    if (visible === false) {
      return null;
    }
    const isNumericString           = ((typeof this.props.value === 'string') || this.props.isNumericString);
    let value                       = isNumericString ? this.props.value : this.parse(this.props.value);
    const startAdornment            = this.props.startAdornment ? <InputAdornment position='start' classes={{root: this.props.classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment              = this.props.endAdornment ? <InputAdornment position='end' classes={{root: this.props.classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;
    const inputClassName            = this.props.variant === 'outlined' ? this.props.classes.inputOutlinedInput : this.props.classes.inputInput;
    const inputFormControlClassName = this.props.variant === 'standard' && this.props.label ? this.props.classes.inputFormControlWithLabel : undefined;
    value                           = !isNullOrUndefined(value) ? value : null;

    if (updateOnChange) {
      return (
        <NumberFormat
          className={this.props.className}
          classes={{root: this.props.classes.formControlRoot}}
          disabled={!!this.props.disabled}
          helperText={!this.props.disableErrors && <span>{(!this.props.disabled && this.props.error ? <this.renderError classes={this.props.classes} error={this.props.error} useTooltipForErrors={this.props.useTooltipForErrors} /> : '')}</span>}
          value={value}
          title={this.getTooltip(value)}
          label={this.props.label}
          onValueChange={this.handleValueChanged}
          onBlur={this.props.onBlur}
          autoFocus={!!this.props.autoFocus}
          onFocus={this.handleFocus}
          thousandSeparator={this.props.thousandSeparator || undefined}
          allowNegative={this.props.allowNegative}
          isAllowed={this.props.isAllowed}
          decimalScale={this.props.decimals}
          fixedDecimalScale={this.props.fixed}
          format={this.props.format}
          mask={this.props.mask}
          isNumericString={isNumericString}
          inputRef={this.inputRef}
          inputProps={{spellCheck: false, className: this.props.classes.nativeInput, style: {textAlign: this.props.align || 'left'}}}
          InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: this.props.classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
          InputLabelProps={{shrink: true, classes: {root: this.props.classes.inputLabelRoot, outlined: this.props.classes.inputLabelOutlined, shrink: this.props.classes.inputLabelShrink}}}
          FormHelperTextProps={{classes: {root: classNames(this.props.classes.helperTextRoot, this.props.useTooltipForErrors ? this.props.classes.helperTextRootErrorIcon : undefined), contained: this.props.classes.helperTextContained}}}
          customInput={this.TextFieldWithErrorProp}
          placeholder={this.props.placeholder}
          variant={this.props.variant as any}
        />);
    }

    return (
      <BlurInputHOC
        {...(this.props as any)}
        value={value}
        onValueChange={(v?: number | string) => this.props.onValueChange(v)}
        render={(props: NumberFieldProps) => (
          <NumberFormat
            className={props.className}
            classes={{root: props.classes.formControlRoot}}
            disabled={!!props.disabled}
            helperText={!props.disableErrors && <span>{(!props.disabled && props.error ? <this.renderError classes={props.classes} error={props.error} useTooltipForErrors={props.useTooltipForErrors} /> : '')}</span>}
            value={props.value}
            title={this.getTooltip(value)}
            label={props.label}
            onValueChange={(values: any) => props.onChange && props.onChange({target: {value: values.floatValue}} as any)}
            onBlur={props.onBlur}
            autoFocus={!!props.autoFocus}
            onFocus={this.handleFocus}
            thousandSeparator={props.thousandSeparator || undefined}
            allowNegative={this.props.allowNegative}
            isAllowed={this.props.isAllowed}
            decimalScale={props.decimals}
            fixedDecimalScale={props.fixed}
            format={props.format}
            mask={props.mask}
            isNumericString={isNumericString}
            inputRef={this.inputRef}
            inputProps={{spellCheck: false, className: props.classes.nativeInput, style: {textAlign: props.align || 'left'}}}
            InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: props.classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
            InputLabelProps={{shrink: true, classes: {root: props.classes.inputLabelRoot, outlined: props.classes.inputLabelOutlined, shrink: props.classes.inputLabelShrink}}}
            FormHelperTextProps={{classes: {root: classNames(props.classes.helperTextRoot, props.useTooltipForErrors ? props.classes.helperTextRootErrorIcon : undefined), contained: props.classes.helperTextContained}}}
            customInput={this.TextFieldWithErrorProp}
            placeholder={props.placeholder}
            variant={props.variant as any}
          />)
        }
      />);
  }
}

export default withStyles(styles, NumberTextField);
