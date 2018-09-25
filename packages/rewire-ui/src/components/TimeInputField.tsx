import * as React from 'react';
import {Theme}                       from '@material-ui/core/styles';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import {TextAlignment}               from './editors';
import {withStyles, WithStyle}       from './styles';

export class TimeValidator {
  rounding: number;
  constructor(rounding?: number) {
    this.rounding = rounding || 0.1;
  }

  parse(value?: string | number) {
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

  private _parse(value?: string) {
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

    result = this._parseFloat(value.match(/^[0-9]?[0-9]?([\.][0-9]?[0-9]?)?$/));
    if (result !== undefined) {
      return result;
    }
    return undefined;
  }

  private parseMilitary(value: RegExpMatchArray | null) {
    if (!value || (value.length < 3)) {
      return undefined;
    }
    return parseInt(value[1], 10) + parseInt(value[2], 10) / 60.0;
  }

  private _parseFloat(value: RegExpMatchArray | null) {
    if (!value || (value.length < 1)) {
      return undefined;
    }
    return parseFloat(value[0]);
  }

  private parseAMPM(value: RegExpMatchArray | null) {
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

  private remainder(v: number) {
    return Math.floor(((v - Math.floor(v)) * 1000) + 0.1) / 1000;
  }

  private round(value: number) {
    switch (this.rounding) {
      case 0:
        return value;
      case 0.25:
        return this._round(value - (7 / 60.0));
      default:
        return this._round(value);
    }
  }

  private _round(value: number) {
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
});

export interface ITimeFieldProps {
  visible?     : boolean;
  disabled?    : boolean;
  error?       : string;
  value?       : number;
  label?       : string;
  align?       : TextAlignment;
  placeholder? : string;
  rounding?    : number;
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
      (nextProps.error !== this.props.error)
    );
  }

  setValue(value?: number | string) {
    this.setState(this._valueToSet(value));
  }

  _valueToSet(value?: number | string): any {
    const state = this.validator.parse(value);
    return {...state, text: state.value ? state.value.toFixed(2) : ''};
  }

  handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const state = this.validator.parse(evt.target.value);
    this.setState({...state, text: evt.target.value});
  }

  handleBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    this.props.onValueChange(this.state.value);
  }

  render() {
    const {visible, disabled, error, label, placeholder} = this.props;
    if (visible === false) {
      return null;
    }
    return (
      <TextField
        disabled={disabled}
        error={!disabled && (!!error || (!!this.state.text && !this.state.isValid))}
        value={this.state.text}
        label={label}
        helperText={!disabled && error}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        placeholder={placeholder}
        inputProps={{autoFocus: this.props.autoFocus, style: {textAlign: this.props.align || 'left'}}}
        InputProps={{classes: {root: this.props.classes.inputRoot}}}
        InputLabelProps={{shrink: true}}
      />);
  }
}

export default withStyles(styles, TimeInputField);
