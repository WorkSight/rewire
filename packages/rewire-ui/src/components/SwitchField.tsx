import * as React              from 'react';
import classNames              from 'classnames';
import Switch, {SwitchProps}   from '@material-ui/core/Switch';
import FormControlLabel        from '@material-ui/core/FormControlLabel';
import {Theme}                 from '@material-ui/core/styles';
import {withStyles, WithStyle} from './styles';

const styles = (theme: Theme) => ({
  inputRoot: {
  },
  switchRoot: {
    width: '3.875em',
    fontSize: '1em',
  },
  switchBase: {
    fontSize: '1em',
    width: '3em',
    height: '3em',
  },
  switchBar: {
    width: '2.125em',
    height: '0.875em',
    marginTop: '-0.4375em',
    marginLeft: '-1.0625em',
    borderRadius: '0.4375em',
  },
  switchIcon: {
    width: '1.25em',
    height: '1.25em',
  },
  switchChecked: {
    transform: 'translateX(0.875em)',
  },
  formControlLabelRoot: {
    marginLeft: '0px',
  },
  formControlLabelLabel: {
    marginLeft: '-0.375em',
    fontSize: '0.875em',
  },
  switchContainerNoLabel: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
  }
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

    const {classes} = this.props;

    if (this.props.label !== undefined) {
      return (
        <FormControlLabel
          className={this.props.className}
          control={
            <Switch
              autoFocus={this.props.autoFocus}
              disabled={this.props.disabled}
              inputProps={{}}
              checked={this.props.value}
              onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.checked)}
              classes={{root: classes.switchRoot, switchBase: classes.switchBase, bar: classes.switchBar, icon: classes.switchIcon, checked: classes.switchChecked}}
            />
          }
          disabled={this.props.disabled}
          label={this.props.label}
          classes={{root: classes.formControlLabelRoot, label: classes.formControlLabelLabel}}
        />
      );
    }

    return (
      <div className={classNames(this.props.className, classes.switchContainerNoLabel)}>
        <Switch
          autoFocus={this.props.autoFocus}
          disabled={this.props.disabled}
          inputProps={{}}
          checked={this.props.value}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.checked)}
          classes={{root: classes.switchRoot, switchBase: classes.switchBase, bar: classes.switchBar, icon: classes.switchIcon, checked: classes.switchChecked}}
        />
      </div>
    );
  }
}

export default withStyles(styles, SwitchInternal);
