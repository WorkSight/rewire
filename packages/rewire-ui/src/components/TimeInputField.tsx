/* eslint-disable no-useless-escape */
import React                         from 'react';
import classNames                    from 'classnames';
import {
  isNullOrUndefined,
  isNullOrUndefinedOrEmpty,
  UTC,
  TimeSpan
}                                    from 'rewire-common';
import {Theme}                       from '@material-ui/core/styles';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import InputAdornment                from '@material-ui/core/InputAdornment';
import ErrorTooltip                  from './ErrorTooltip';
import {TextAlignment, TextVariant}  from './editors';
import {withStyles, WithStyle}       from './styles';

type MapFn<T> = (item?: T) => string;

export class TimeValidator {
  rounding: number;
  constructor(rounding?: number) {
    this.rounding = !isNullOrUndefined(rounding) ? rounding! : 0.25;
  }

  parse(value?: string | number): {value?: '-' | '.' | '-.' | number, isValid: boolean} {
    if (typeof value === 'number') {
      const rounded = this.round(value);
      return {
        value   : rounded,
        isValid : true
      };
    }

    if (value === '-' || value === '.' || value === '-.') {
      return {
        value:   value,
        isValid: false
      };
    }

    const v      = this._parse(value);
    const isNull = isNullOrUndefined(v);
    if (isNull || this.rounding === 0) {
      return {
        value   : isNull ? v : this._round(v!),
        isValid : v !== undefined,
      };
    }

    const rounded = this.round(v!);
    return {
      value   : rounded,
      isValid : true
    };
  }

  private _parse(value?: string): number | undefined {
    if (isNullOrUndefinedOrEmpty(value)) {
      return undefined;
    }

    let result = this.parseMilitary(value!.match(/^(-?[0-9]?[0-9])[:;\/]([0-5][0-9])$/));
    if (!isNullOrUndefined(result)) {
      return result;
    }

    result = this.parseAMPM(value!.match(/^(-?0?[1-9]|1[0-2])([:;\/]([0-5][0-9]))? *(am|pm)?$/i));
    if (!isNullOrUndefined(result)) {
      return result;
    }

    result = this._parseFloat(value!.match(/^-?[0-9]?[0-9]?([\.][0-9]*)?$/));
    if (!isNullOrUndefined(result)) {
      return parseFloat(result!.toFixed(2));
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
    const minutes = value[3] ? parseInt(value[3], 10) / 60.0 : 0;
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
        return this._round(value);
      case 0.25:
        return this._round(value - (7 / 60.0));
      default:
        return this._round(value);
    }
  }

  private _round(value: number): number {
    if (this.rounding === 0) {
      const n = 10000;
      return Math.round( value * n + Number.EPSILON ) / n;
    }

    const remainder = this.remainder(value);
    const d = (remainder * 10) % (this.rounding * 10);
    if (Math.abs(d) < 0.00001) {
      return value;
    }
    return Math.floor(value) + Math.floor(((remainder + this.rounding) / this.rounding) + 0.0001) * this.rounding;
  }
}

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

export type TimeInputFieldStyles = ReturnType<typeof styles>;

export interface ITimeFieldProps {
  visible?              : boolean;
  disabled?             : boolean;
  readOnly?             : boolean;
  disableErrors?        : boolean;
  useTooltipForErrors?  : boolean;
  error?                : string;
  value?                : number | string;
  label?                : string;
  tooltip?              : string | ((value: any) => string);
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
  map?: MapFn<any>;
}

const ampmClock = {
  hour:     'numeric', // 'numeric' => 3:15 PM '2-digit' => 03:15 PM
  minute:   'numeric',
  timeZone: 'GMT',
  hourCycle: 'h11',
  hour12:    true
} as Intl.DateTimeFormatOptions;
const uppercaseFormatter = new Intl.DateTimeFormat('en-US', ampmClock);

export interface ITimeState {
  value?:   '-' | '.' | '-.' | number;
  isValid?: boolean;
  text:     string;
}

export type TimeFieldProps = WithStyle<TimeInputFieldStyles, TextFieldProps & ITimeFieldProps>;

function defaultMap(v: any): any {
  return v;
}

class TimeInputField extends React.Component<TimeFieldProps, ITimeState> {
  validator: TimeValidator;
  inputRef: React.RefObject<HTMLInputElement>;
  constructor(props: TimeFieldProps) {
    super(props);
    this.validator = new TimeValidator(props.rounding);
    this.inputRef  = React.createRef();
    const map      = props.map || defaultMap;
    this.state     = this._valueToSet(map(props.value));
    this.setState(this.state);
  }

  UNSAFE_componentWillReceiveProps (nextProps: TimeFieldProps) {
    const map = nextProps.map || defaultMap;
    this.setValue(map(nextProps.value));
  }

  shouldComponentUpdate(nextProps: TimeFieldProps, nextState: ITimeState) {
    return (
      (nextState.text                !== this.state.text)                ||
      (nextProps.disabled            !== this.props.disabled)            ||
      (nextProps.readOnly            !== this.props.readOnly)            ||
      (nextProps.visible             !== this.props.visible)             ||
      (nextProps.error               !== this.props.error)               ||
      (nextProps.rounding            !== this.props.rounding)            ||
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

  setValue(value?: number | string) {
    this.setState(this._valueToSet(value));
  }

  _valueToSet(value?: number | string): any {
    const state = this.validator.parse(value);
    return {...state, text: !isNullOrUndefinedOrEmpty(state.value) ? `${state.value}` : ''};
  }

  handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const state = this.validator.parse(evt.target.value);
    this.setState({...state, text: evt.target.value});
  };

  handleBlur = (_evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.state.value === this.props.value) {
      this.setState({text: !isNullOrUndefinedOrEmpty(this.state.value) ? `${this.state.value}` : ''});
    }
    this.props.onValueChange(this.state.value as (number | undefined));
  };

  handleFocus = (evt: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.selectOnFocus) {
      evt.target.setSelectionRange(0, evt.target.value.length);
    } else if (this.props.endOfTextOnFocus) {
      evt.target.setSelectionRange(evt.target.value.length, evt.target.value.length);
    } else if (!isNullOrUndefined(this.props.cursorPositionOnFocus)) {
      const cursorPosition = Math.max(0, Math.min(this.props.cursorPositionOnFocus!, evt.target.value.length));
      evt.target.setSelectionRange(cursorPosition, cursorPosition);
    }
  };

  getTooltip(value: ITimeState): string | undefined {
    let tooltip = this.props.tooltip;
    if (isNullOrUndefined(tooltip)) {
      const time  = value.value;
      if (typeof time === 'number' && value.text) {
        const days   = (time < 0) ? Math.trunc(Math.abs(time) / 24) + 1 : Math.trunc(time / 24);
        const prefix = (days > 0) ? `${days} day${days > 1 ? 's' : ''} ${(time < 0) ? 'preceding' : 'following'} at ` : '';
        return `${prefix}${uppercaseFormatter.format(UTC.now().startOfDay().add(time as number, TimeSpan.hours).roundToMinutes().utc)}`;
      } else {
        return undefined;
      }
    }
    if (is.function(tooltip))  {
      tooltip = (tooltip as CallableFunction)(value);
    }
    return tooltip as string;
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
    const {classes, className, visible, disabled, readOnly, error, label, placeholder, align, disableErrors, autoFocus, variant, useTooltipForErrors} = this.props;
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
        disabled={!!disabled}
        error={!disableErrors && !disabled && (!!error || (!!this.state.text && !this.state.isValid))}
        value={this.state.text}
        label={label}
        helperText={!disableErrors && <span>{(!disabled && error ? <this.renderError classes={classes} error={error} useTooltipForErrors={useTooltipForErrors} /> : '')}</span>}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        autoFocus={!!autoFocus}
        placeholder={placeholder}
        title={this.getTooltip(this.state)}
        variant={variant as any}
        inputRef={this.inputRef}
        inputProps={{spellCheck: false, className: classes.nativeInput, style: {textAlign: align || 'left'}}}
        InputProps={{readOnly: !!readOnly, startAdornment: startAdornment, endAdornment: endAdornment, classes: {root: classes.inputRoot, input: inputClassName, formControl: inputFormControlClassName}}}
        InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelOutlined, shrink: classes.inputLabelShrink}}}
        FormHelperTextProps={{classes: {root: classNames(classes.helperTextRoot, this.props.useTooltipForErrors ? classes.helperTextRootErrorIcon : undefined), contained: classes.helperTextContained}}}
      />);
  }
}

export default withStyles(styles, TimeInputField);
