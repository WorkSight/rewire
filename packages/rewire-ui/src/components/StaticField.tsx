import React                    from 'react';
import {isNullOrUndefined}           from 'rewire-common';
import {Theme}                       from '@material-ui/core/styles';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import {withStyles, WithStyle}       from './styles';
import {TextAlignment}               from './editors';

const styles = (theme: Theme) => ({
  inputRoot: {
    fontSize: 'inherit',
    lineHeight: 'inherit',
    '&::before': {
      display: 'none',
    },
  },
  inputLabelRoot: {
    fontSize: 'inherit',
    '&$inputLabelDisabled': {
      color: theme.palette.text.secondary,
    },
  },
  inputLabelDisabled: {
  },
});

export type StaticFieldStyles = ReturnType<typeof styles>;

export interface IStaticFieldProps {
  visible?: boolean;
  classes?: React.CSSProperties;
  value?  : string;
  tooltip?: string | ((value: any) => string);
  label?  : string;
  align?  : TextAlignment;

  onValueChange: (value?: string) => void;
}

export type StaticFieldProps = WithStyle<StaticFieldStyles, IStaticFieldProps & TextFieldProps>;

class StaticFieldInternal extends React.Component<StaticFieldProps> {
  constructor(props: StaticFieldProps) {
    super(props);
  }

  shouldComponentUpdate(nextProps: IStaticFieldProps) {
    return (
      (nextProps.value   !== this.props.value)   ||
      (nextProps.visible !== this.props.visible) ||
      (nextProps.label   !== this.props.label)   ||
      (nextProps.align   !== this.props.align)   ||
      (nextProps.tooltip !== this.props.tooltip)
    );
  }

  getTooltip(value: any): string | undefined {
    let tooltip = this.props.tooltip;
    if (isNullOrUndefined(tooltip)) {
      return value;
    }
    if (is.function(tooltip))  {
      tooltip = (tooltip as CallableFunction)(value);
    }
    return tooltip as string;
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    const {classes} = this.props;
    let value       = !isNullOrUndefined(this.props.value) ? this.props.value : '';

    return (
      <TextField
        className={this.props.className}
        disabled={true}
        label={this.props.label}
        value={value}
        title={this.getTooltip(value)}
        type={this.props.type}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.value)}
        InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, disabled: classes.inputLabelDisabled}}}
        InputProps={{style: {color: 'inherit'}, classes: {root: classes.inputRoot}}}
        inputProps={{spellCheck: false, style: {textAlign: this.props.align || 'left'}}}
      />);
  }
}

export default withStyles(styles, StaticFieldInternal);
