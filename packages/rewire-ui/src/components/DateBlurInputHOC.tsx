import React         from 'react';
import { DateFieldProps } from './DateField';

export interface IDateBlurState {
  readonly value?: Date | null;
  readonly inputValue?: string | null;
  currentExternalValue?: Date | null;
  currentExternalInputValue?: string | null;
}

export type IDateBlurProps = {
  render<T>(props: IDateBlurProps & T): JSX.Element | null,
  onValueChange(value?: Date | null): void,
} & DateFieldProps;

export default class DateBlurInputHOC extends React.PureComponent<IDateBlurProps, IDateBlurState> {
  state: IDateBlurState;
  constructor(props: IDateBlurProps) {
    super(props);
    this.state = {
      value: props.value as Date | null,
      currentExternalValue: props.value as Date | null,
      inputValue: props.inputValue as string | null,
      currentExternalInputValue: props.inputValue as string | null,
    };
  }

  UNSAFE_componentWillReceiveProps (nextProps: IDateBlurProps) {
    if (nextProps.value !== this.state.currentExternalValue ||
        nextProps.inputValue !== this.state.currentExternalInputValue
    ) { // only override the internal state if the value or inputValue has been changed outside the control!!
      this.setState({
        value: nextProps.value as Date | null,
        currentExternalValue: nextProps.value as Date | null,
        inputValue: nextProps.inputValue as string | null,
        currentExternalInputValue: nextProps.inputValue as string | null,
      });
    }
  }

  handleOnChange = (date?: Date | null, inputValue?: string | null) => {
    this.setState({value: date, inputValue: inputValue});
  };

  handleOnKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.keyCode === 13) {
      this.props.onValueChange(this.state.value);
    }
  };

  handleOnBlur = (_evt: any) => {
    if (this.props.onValueChange) {
      this.props.onValueChange(this.state.value);
    }
  };

  render() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { render, onValueChange, ...rest } = {...this.props, onKeyDown: this.handleOnKeyDown, onBlur: this.handleOnBlur, onChange: this.handleOnChange, value: this.state.value, inputValue: this.state.inputValue};
    return this.props.render(rest as any);
  }
}
