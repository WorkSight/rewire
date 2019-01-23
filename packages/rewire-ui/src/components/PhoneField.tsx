import * as React                       from 'react';
import {Theme}                          from '@material-ui/core/styles';
import {TextFieldProps}                 from '@material-ui/core/TextField';
import {withStyles, WithStyle}          from './styles';
import NumberField, {INumberFieldProps} from './NumberField';

export const defaultPhoneFormat = '+# (###) ###-####';
export const defaultPhoneMask   = 'x';

const styles = (theme: Theme) => ({
  inputRoot: {
  },
  formControlRoot: {
  },
});

interface IPhoneFieldProps extends INumberFieldProps {
  mask: string;
}

type PhoneFieldProps = WithStyle<ReturnType<typeof styles>, TextFieldProps & IPhoneFieldProps>;

class PhoneField extends React.Component<PhoneFieldProps> {
  constructor(props: PhoneFieldProps) {
    super(props);
  }

  render() {
    const {format, mask, placeholder, ...otherProps} = this.props;
    let phoneFormat      = format || defaultPhoneFormat;
    let phoneMask        = mask || defaultPhoneMask;
    let phonePlaceholder = phoneFormat && phoneMask && phoneFormat.slice().replace(new RegExp(/#/, 'g'), phoneMask) || placeholder;

    return (
      <NumberField format={phoneFormat} mask={phoneMask} placeholder={phonePlaceholder} {...otherProps} />
    );
  }
}

export default withStyles(styles, PhoneField);
