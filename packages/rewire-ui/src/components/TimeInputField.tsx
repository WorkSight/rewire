import * as React from 'react';
import {Theme}                       from '@material-ui/core/styles';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import InputAdornment                from '@material-ui/core/InputAdornment';
import {TextAlignment, TextVariant}  from './editors';
import {withStyles, WithStyle}       from './styles';

export class TimeValidator {
  rounding: number;
  constructor(rounding?: number) {
    this.rounding = rounding !== undefined ? rounding : 0.1;
  }

  parse(value?: string | number): any {
    if (typeof value === 'number') {
      const rounded = this.round(value);
      return {
        value   : rounded,
        isValid : rounded === value
      };
    }

    const v = this._parse(value);
    if ((v === undefined) || (this.rounding === 0)) {
      return {
        value   : v,
        isValid : v !== undefined
      };
    }

    const rounded = this.round(v);
    return {
      value   : rounded,
      isValid : rounded === v
    };
  }

  private _parse(value?: string): number | undefined {
    if (!value) {
      return undefined;
    }

    let result = this.parseMilitary(value.match(/^([0-9]?[0-9])[:;\/]([0-5][0-9])$/));
    if (result !==  undefined) {
      return result;
    }

    result = this.parseAMPM(value.match(/^(0?[1-9]|1[0-2])([:;\/]([0-5][0-9]))? *(am|pm)?$/i));
    if (result !== undefined) {
      return result;
    }

    result = this._parseFloat(value.match(/^[0-9]?[0-9]?([\.][0-9]*)?$/));
    if (result !== undefined) {
      return parseFloat(result.toFixed(2));
    }
    return undefined;
  }

  private parseMilitary(value: RegExpMatchArray | null): number | undefined {
    if (!value || (value.length < 3)) {
      return undefined;
    }
    return parseInt(value[1], 10) + parseInt(value[2], 10) / 60.0;
  }

  private _parseFloat(value: RegExpMatchArray | null): number | undefined {
    if (!value || (value.length < 1)) {
      return undefined;
    }
    return parseFloat(value[0]);
  }

  private parseAMPM(value: RegExpMatchArray | null): number | undefined {
    if (!value || (value.length < 5)) {
      return undefined;
    }

    let hours   = parseInt(value[1], 10);
    let minutes = value[3] ? parseInt(value[3], 10) / 60.0 : 0;
    if (value[4] && (value[4].toLowerCase() === 'pm')) {
      hours += 12;
    }
    return hours + minutes;
  }

  private remainder(v: number): number {
    return Math.floor(((v - Math.floor(v)) * 1000) + 0.1) / 1000;
  }

  private round(value: number): number {
    switch (this.rounding) {
      case 0:
        return value;
      case 0.25:
        return this._round(value - (7 / 60.0));
      default:
        return this._round(value);
    }
  }

  private _round(value: number): number {
    if (this.rounding === 0) {
      return value;
    }

    let remainder = this.remainder(value);
    let d = (remainder * 10) % (this.rounding * 10);
    if (Math.abs(d) < 0.00001) {
      return value;
    }
    return Math.floor(value) + Math.floor(((remainder + this.rounding) / this.rounding) + 0.0001) * this.rounding;
  }
}

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
  inputLabelRootShrink: {
    transform: 'translate(14px, -0.375em) scale(0.75) !important',
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
  helperTextContained: {
    marginLeft: '14px',
    marginRight: '14px',
  },
});

export interface ITimeFieldProps {
  visible?              : boolean;
  disabled?             : boolean;
  disableErrors?        : boolean;
  error?                : string;
  value?                : number;
  label?                : string;
  align?                : TextAlignment;
  variant?              : TextVariant;
  placeholder?          : string;
  rounding?             : number;
  selectOnFocus?        : boolean;
  endOfTextOnFocus?     : boolean;
  cursorPositionOnFocus?: number;
  startAdornment?       : JSX.Element;
  endAdornment?         : JSX.Element;

  onValueChange: (value?: number) => void;
}

export interface ITimeState {
  value?: number;
  isValid: boolean;
  text: string;
}

type TimeFieldProps = WithStyle<ReturnType<typeof styles>, TextFieldProps & ITimeFieldProps>;

class TimeInputField extends React.Component<TimeFieldProps, ITimeState> {
  validator: TimeValidator;
  constructor(props: TimeFieldProps) {
    super(props);
    this.validator = new TimeValidator(props.rounding);
    this.state     = this._valueToSet(props.value);
  }

  componentWillReceiveProps (nextProps: TimeFieldProps) {
    this.setValue(nextProps.value);
  }

  shouldComponentUpdate(nextProps: TimeFieldProps, nextState: ITimeState) {
    return (
      (nextState.text !== this.state.text) ||
      (nextProps.disabled !== this.props.disabled) ||
      (nextProps.visible !== this.props.visible) ||
      (nextProps.error !== this.props.error) ||
      (nextProps.rounding !== this.props.rounding) ||
      (nextProps.label !== this.props.label) ||
      (nextProps.placeholder !== this.props.placeholder) ||
      (nextProps.align !== this.props.align) ||
      (nextProps.variant !== this.props.variant) ||
      (nextProps.disableErrors !== this.props.disableErrors) ||
      (nextProps.startAdornment !== this.props.startAdornment) ||
      (nextProps.endAdornment !== this.props.endAdornment)
    );
  }

  setValue(value?: number | string) {
    this.setState(this._valueToSet(value));
  }

  _valueToSet(value?: number | string): any {
    const state = this.validator.parse(value);
    return {...state, text: state.value ? state.value : ''};
  }

  handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const state = this.validator.parse(evt.target.value);
    this.setState({...state, text: evt.target.value});
  }

  handleBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    this.props.onValueChange(this.state.value);
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

  render() {
    const {classes, className, visible, disabled, error, label, placeholder, align, disableErrors, autoFocus, variant} = this.props;
    if (visible === false) {
      return null;
    }

    const startAdornment            = this.props.startAdornment ? <InputAdornment position='start' classes={{root: classes.inputAdornmentRoot}}>{this.props.startAdornment}</InputAdornment> : undefined;
    const endAdornment              = this.props.endAdornment ? <InputAdornment position='end' classes={{root: classes.inputAdornmentRoot}}>{this.props.endAdornment}</InputAdornment> : undefined;
    const inputClassName            = variant === 'outlined' ? classes.inputOutlinedInput : classes.inputInput;
    const inputFormControlClassName = variant === 'standard' && this.props.label ? classes.inputFormControlWithLabel : undefined;

    return (
      <TextField
        className={className}
        classes={{root: classes.formControlRoot}}
        disabled={disabled}
        error={!disableErrors && !disabled && (!!error || (!!this.state.text && !this.state.isValid))}
        value={this.state.text}
        label={label}
        helperText={!disableErrors && <span>{(!disabled && error) || ''}</span>}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        placeholder={placeholder}
        variant={variant}
        inputProps={{autoFocus: autoFocus, className: classes.nativeInput, style: {textAlign: align || 'left'}}}
        InputProps={{startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
        InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelRootShrink}}}
        FormHelperTextProps={{classes: {root: classes.helperTextRoot, contained: classes.helperTextContained}}}
      />);
  }
}

export default withStyles(styles, TimeInputField);
