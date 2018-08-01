import * as React from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import {TextAlignment}               from './editors';

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

export default class TimeInputField extends React.Component<TextFieldProps & ITimeFieldProps, ITimeState> {
  validator: TimeValidator;
  constructor(props: TextFieldProps & ITimeFieldProps) {
    super(props);
    this.validator = new TimeValidator(props.rounding);
  }

  componentWillReceiveProps (nextProps: ITimeFieldProps) {
    this.setValue(nextProps.value);
  }

  shouldComponentUpdate(nextProps: ITimeFieldProps, nextState: ITimeState) {
    return (nextState.text !== this.state.text);
  }

  setValue(value?: number | string) {
    const state = this.validator.parse(value);
    this.setState({...state, text: state.value ? state.value.toFixed(2) : ''});
  }

  componentWillMount() {
    this.setValue(this.props.value);
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
        error={error || !!(this.state.text && !this.state.isValid)}
        value={this.state.text}
        label={label}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        placeholder={placeholder}
        inputProps={{autoFocus: this.props.autoFocus, style: {textAlign: this.props.align || 'left'}}}
      />);
  }
}
