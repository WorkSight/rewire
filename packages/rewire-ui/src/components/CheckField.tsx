import * as React                from 'react';
import Checkbox, {CheckboxProps} from '@material-ui/core/Checkbox';
import FormControlLabel          from '@material-ui/core/FormControlLabel';

export interface ICheckboxProps {
  visible?     : boolean;
  disabled?    : boolean;
  value?       : boolean;
  label?       : string;
  onValueChange: (value?: boolean) => void;
}

export default class CheckboxInternal extends React.Component<CheckboxProps & ICheckboxProps> {
  constructor(props: CheckboxProps & ICheckboxProps) {
    super(props);
  }

  shouldComponentUpdate(nextProps: ICheckboxProps) {
    return (
      (nextProps.value !== this.props.value) ||
      (nextProps.disabled !== this.props.disabled) ||
      (nextProps.visible !== this.props.visible)
    );
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    if (this.props.label !== undefined) {
      return (
        <FormControlLabel
          control={
            <Checkbox
              className={this.props.className}
              autoFocus={this.props.autoFocus}
              disabled={this.props.disabled}
              inputProps={{autoFocus: this.props.autoFocus}}
              checked={this.props.value}
              onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.checked)}
            />
          }
          disabled={this.props.disabled}
          label={this.props.label}
        />
      );
    }

    return (
      <Checkbox
        className={this.props.className}
        autoFocus={this.props.autoFocus}
        disabled={this.props.disabled}
        inputProps={{autoFocus: this.props.autoFocus}}
        checked={this.props.value}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.checked)}
      />
    );
  }
}
