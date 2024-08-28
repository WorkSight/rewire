import React                       from 'react';
import {Theme}                          from '@material-ui/core/styles';
import {TextFieldProps}                 from '@material-ui/core/TextField';
import {withStyles, WithStyle}          from './styles';
import NumberField, {INumberFieldProps} from './NumberField';

export const defaultPhoneFormat = '+# (###) ###-####';
export const defaultPhoneMask   = 'x';

const styles = (_theme: Theme) => ({
  inputRoot: {
  },
  formControlRoot: {
  },
});

export type PhoneFieldStyles = ReturnType<typeof styles>;

export interface IPhoneFieldProps extends INumberFieldProps {
  mask: string;
}

export type PhoneFieldProps = WithStyle<PhoneFieldStyles, TextFieldProps & IPhoneFieldProps>;

class PhoneField extends React.Component<PhoneFieldProps> {
  constructor(props: PhoneFieldProps) {
    super(props);
  }

  render() {
    const {format, mask, placeholder, ...otherProps} = this.props;
    const phoneFormat      = format || defaultPhoneFormat;
    const phoneMask        = mask || defaultPhoneMask;
    const phonePlaceholder = phoneFormat && phoneMask && phoneFormat.slice().replace(new RegExp(/#/, 'g'), phoneMask) || placeholder;

    return (
      <NumberField format={phoneFormat} mask={phoneMask} placeholder={phonePlaceholder} isNumericString={true} {...otherProps} />
    );
  }
}

export default withStyles(styles, PhoneField);
