import React         from 'react';
import { TextFieldProps } from '@material-ui/core/TextField';
import { InputProps }     from '@material-ui/core/Input';
import { TextAlignment }  from './editors';

export interface IBlurState {
  readonly value?: string | number | React.ReactText[] | unknown;
  currentExternalValue?: string | number | React.ReactText[] | unknown;
}

export type IBlurProps = {
  align?: TextAlignment,
  disableErrors?: boolean,
  render<T>(props: TextFieldProps & T): JSX.Element | null,
  onValueChange(value?: string | number | React.ReactText[]): void
} & TextFieldProps & InputProps;

export default class BlurInputHOC extends React.Component<IBlurProps, IBlurState> {
  state: IBlurState = {value: undefined};
  constructor(props: IBlurProps) {
    super(props);
    this.state = {
      value: props.value,
      currentExternalValue: props.value
    };
  }

  UNSAFE_componentWillReceiveProps (nextProps: IBlurProps) {
    if (nextProps.value !== this.state.currentExternalValue) { // only override the internal state if the value has been changed outside the control!!
      this.setState({value: nextProps.value, currentExternalValue: nextProps.value});
    }
  }

  shouldComponentUpdate(nextProps: IBlurProps, nextState: IBlurState) {
    return (
      (nextProps.value                !== this.props.value)                ||
      (nextProps.type                 !== this.props.type)                 ||
      (nextProps.error                !== this.props.error)                ||
      (nextProps.disabled             !== this.props.disabled)             ||
      (nextProps.label                !== this.props.label)                ||
      (nextProps.placeholder          !== this.props.placeholder)          ||
      (nextProps.align                !== this.props.align)                ||
      (nextProps.multiline            !== this.props.multiline)            ||
      (nextProps.rows                 !== this.props.rows)                 ||
      (nextProps.rowsMax              !== this.props.rowsMax)              ||
      (nextProps.variant              !== this.props.variant)              ||
      (nextProps.disableErrors        !== this.props.disableErrors)        ||
      (nextProps.startAdornment       !== this.props.startAdornment)       ||
      (nextProps.endAdornment         !== this.props.endAdornment)         ||
      (nextState.value                !== this.state.value)                ||
      (nextState.currentExternalValue !== this.state.currentExternalValue)
    );
  }

  handleOnChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({value: evt.target.value});
  };

  handleOnKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.keyCode === 13) {
      this.props.onValueChange(this.state.value as any);
    }
  };

  handleOnBlur = (_evt: any) => {
    if (this.props.onValueChange) {
      this.props.onValueChange(this.state.value as any);
    }
  };

  render() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { render, onValueChange, ...rest } = {...this.props, onKeyDown: this.handleOnKeyDown, onBlur: this.handleOnBlur, onChange: this.handleOnChange, value: this.state.value};
    return this.props.render(rest as any);
  }
}
