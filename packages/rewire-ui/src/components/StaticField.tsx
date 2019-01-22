import * as React                    from 'react';
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
  },
  inputLabelRootShrink: {
    transform: 'translate(14px, -0.375em) scale(0.75) !important',
  },
});

export interface IStaticFieldProps {
  visible?: boolean;
  classes?: React.CSSProperties;
  value?  : string;
  label?  : string;
  align?  : TextAlignment;

  onValueChange: (value?: string) => void;
}

type StaticFieldProps = WithStyle<ReturnType<typeof styles>, IStaticFieldProps & TextFieldProps>;

class StaticFieldInternal extends React.Component<StaticFieldProps> {
  constructor(props: StaticFieldProps) {
    super(props);
  }

  shouldComponentUpdate(nextProps: IStaticFieldProps) {
    return (
      (nextProps.value !== this.props.value) ||
      (nextProps.visible !== this.props.visible) ||
      (nextProps.label !== this.props.label) ||
      (nextProps.align !== this.props.align)
    );
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    const {classes} = this.props;

    return (
      <TextField
        className={this.props.className}
        disabled={true}
        label={this.props.label}
        value={this.props.value}
        type={this.props.type}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.value)}
        InputLabelProps={{shrink: true, classes: {root: classes.inputLabelRoot, outlined: classes.inputLabelRootShrink}}}
        InputProps={{style: {color: 'inherit'}, classes: {root: classes.inputRoot}}}
        inputProps={{style: {textAlign: this.props.align || 'left'}}}
      />);
  }
}

export default withStyles(styles, StaticFieldInternal);
