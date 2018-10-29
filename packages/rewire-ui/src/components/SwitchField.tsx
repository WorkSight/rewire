import * as React              from 'react';
import Switch, {SwitchProps}   from '@material-ui/core/Switch';
import FormControlLabel        from '@material-ui/core/FormControlLabel';
import {Theme}                 from '@material-ui/core/styles';
import {withStyles, WithStyle} from './styles';

const styles = (theme: Theme) => ({
});

export interface ISwitchProps {
  visible? : boolean;
  disabled?: boolean;
  value?   : boolean;
  label?   : string;

  onValueChange: (value?: boolean) => void;
}

type SwitchPropsStyled = WithStyle<ReturnType<typeof styles>, SwitchProps & ISwitchProps>;

class SwitchInternal extends React.Component<SwitchPropsStyled> {
  constructor(props: SwitchPropsStyled) {
    super(props);
  }

  shouldComponentUpdate(nextProps: SwitchPropsStyled) {
    return (
      (nextProps.value !== this.props.value) ||
      (nextProps.disabled !== this.props.disabled) ||
      (nextProps.visible !== this.props.visible) ||
      (nextProps.label !== this.props.label)
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

export default withStyles(styles, SwitchInternal);
