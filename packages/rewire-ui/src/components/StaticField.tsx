import * as React                    from 'react';
import {Theme}                       from '@material-ui/core/styles';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import {withStyles, WithStyle}       from './styles';
import {TextAlignment}               from './editors';

const styles = (theme: Theme) => ({
  inputRoot: {
    lineHeight: 'inherit',
    '&::before': {
      display: 'none',
    },
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
      (nextProps.visible !== this.props.visible)
    );
  }

  render() {
    if (this.props.visible === false) {
      return null;
    }

    return (
      <TextField
        className={this.props.className}
        disabled={true}
        label={this.props.label}
        value={this.props.value}
        type={this.props.type}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => this.props.onValueChange(evt.target.value)}
        InputLabelProps={{shrink: true}}
        InputProps={{style: {color: 'inherit'}, classes: {root: this.props.classes.inputRoot}}}
        inputProps={{style: {textAlign: this.props.align || 'left'}}}
      />);
  }
}

export default withStyles(styles, StaticFieldInternal);
