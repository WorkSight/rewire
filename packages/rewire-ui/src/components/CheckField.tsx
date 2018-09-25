import * as React                from 'react';
import Checkbox, {CheckboxProps} from '@material-ui/core/Checkbox';
import FormControlLabel          from '@material-ui/core/FormControlLabel';
import {Theme}                   from '@material-ui/core/styles';
import {withStyles, WithStyle}   from './styles';

const styles = (theme: Theme) => ({
  inputRoot: {
    lineHeight: 'inherit',
  },
  checkboxRoot: {
    width: '24px',
    height: '24px',
  },
  formControlLabelRoot: {
    marginLeft: '0px',
  }
  formControlLabelLabel: {
    paddingLeft: '8px',
  },
});

export interface ICheckboxProps {
  visible?     : boolean;
  disabled?    : boolean;
  value?       : boolean;
  label?       : string;
  onValueChange: (value?: boolean) => void;
}

type CheckBoxPropsStyled = WithStyle<ReturnType<typeof styles>, CheckboxProps & ICheckboxProps>;

export default class CheckboxInternal extends React.Component<CheckboxPropsStyled> {
  constructor(props: CheckboxPropsStyled) {
    super(props);
  }

  shouldComponentUpdate(nextProps: CheckboxPropsStyled) {
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
              classes={{root: this.props.classes.checkboxRoot}}
            />
          }
          disabled={this.props.disabled}
          label={this.props.label}
          classes={{root: this.props.classes.formControlLabelRoot, label: this.props.classes.formControlLabelLabel}}
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
        classes={{root: this.props.classes.checkboxRoot}}
      />
    );
  }
}

export default withStyles(styles, CheckboxInternal);
