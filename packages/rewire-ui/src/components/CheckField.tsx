import * as React                from 'react';
import classNames                from 'classnames';
import Checkbox, {CheckboxProps} from '@material-ui/core/Checkbox';
import FormControlLabel          from '@material-ui/core/FormControlLabel';
import {Theme}                   from '@material-ui/core/styles';
import {isNullOrUndefined}       from 'rewire-common';
import {withStyles, WithStyle}   from './styles';

const styles = (theme: Theme) => ({
  inputRoot: {
  },
  checkboxRoot: {
    width: '1.5em',
    height: '1.5em',
    fontSize: '1em',
    padding: 0,
    '& svg': {
      fontSize: '1.5em',
    },
  },
  formControlLabelRoot: {
    marginLeft: '0px',
  },
  formControlLabelLabel: {
    paddingLeft: '0.5em',
    fontSize: '0.875em',
  },
  checkboxContainerNoLabel: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
  }
});

export interface ICheckboxProps {
  visible? : boolean;
  disabled?: boolean;
  value?   : boolean;
  label?   : string;

  onValueChange: (value?: boolean) => void;
}

type CheckboxPropsStyled = WithStyle<ReturnType<typeof styles>, CheckboxProps & ICheckboxProps>;

class CheckboxInternal extends React.Component<CheckboxPropsStyled> {
  constructor(props: CheckboxPropsStyled) {
    super(props);
  }

  shouldComponentUpdate(nextProps: CheckboxPropsStyled) {
    return (
      (nextProps.value    !== this.props.value)    ||
      (nextProps.disabled !== this.props.disabled) ||
      (nextProps.visible  !== this.props.visible)  ||
      (nextProps.label    !== this.props.label)
    );
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    if (!isNullOrUndefined(this.props.label)) {
      return (
        <FormControlLabel
          className={this.props.className}
          control={
            <Checkbox
              autoFocus={this.props.autoFocus}
              disabled={this.props.disabled}
              inputProps={{}}
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
      <div className={classNames(this.props.className, this.props.classes.checkboxContainerNoLabel)}>
        <Checkbox
          autoFocus={this.props.autoFocus}
          disabled={this.props.disabled}
          inputProps={{}}
          checked={this.props.value}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.checked)}
          classes={{root: this.props.classes.checkboxRoot}}
        />
      </div>
    );
  }
}

export default withStyles(styles, CheckboxInternal);
