import * as React            from 'react';
import Switch, {SwitchProps} from '@material-ui/core/Switch';
import FormControlLabel      from '@material-ui/core/FormControlLabel';

export interface ISwitchProps {
  visible?     : boolean;
  disabled?    : boolean;
  value?       : boolean;
  label?       : string;
  onValueChange: (value?: boolean) => void;
}

export default class SwitchInternal extends React.Component<SwitchProps & ISwitchProps> {
  constructor(props: SwitchProps & ISwitchProps) {
    super(props);
  }

  shouldComponentUpdate(nextProps: ISwitchProps) {
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
            <Switch
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
      <Switch
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
