import * as React       from 'react';
import {TextFieldProps} from '@material-ui/core/TextField';

export interface IBlurState {
  readonly value?: string | number | React.ReactText[];
  currentExternalValue?: string | number | React.ReactText[];
}

export type IBlurProps = {render<T>(props: TextFieldProps & T): JSX.Element | null, onValueChange(value?: string | number | React.ReactText[]): void} & TextFieldProps;

export default class BlurInputHOC extends React.Component<IBlurProps, IBlurState> {
  state: IBlurState = {value: undefined};
  constructor(props: IBlurProps) {
    super(props);
    this.state = {value: props.value, currentExternalValue: props.value};
  }

  componentWillReceiveProps (nextProps: IBlurProps) {
    if (nextProps.value !== this.state.currentExternalValue) { // only override the internal state if the value has been changed outside the control!!
      this.setState({value: nextProps.value, currentExternalValue: nextProps.value});
    }
  }

  shouldComponentUpdate(nextProps: IBlurProps, nextState: IBlurState) {
    return (
      (nextProps.value !== this.props.value) ||
      (nextProps.error !== this.props.error) ||
      (nextProps.disabled !== this.props.disabled) ||
      (nextState.value !== this.state.value) ||
      (nextState.currentExternalValue !== this.state.currentExternalValue)
    );
  }

  handleOnChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({value: evt.target.value});
  }

  handleOnKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.keyCode === 13) {
      this.props.onValueChange(this.state.value);
    }
  }

  handleOnBlur = (evt: any) => {
    if (this.props.onValueChange) {
      this.props.onValueChange(this.state.value);
    }
  }

  render() {
    const { render, onValueChange, ...rest } = {...this.props, onKeyDown: this.handleOnKeyDown, onBlur: this.handleOnBlur, onChange: this.handleOnChange, value: this.state.value};
    return this.props.render(rest as any);
  }
}
