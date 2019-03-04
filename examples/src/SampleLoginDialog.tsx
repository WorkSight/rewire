import {
  Form,
  Modal,
  isRequired,
  and,
  isSameAsOther
}                    from 'rewire-ui';
import { delay }     from 'rewire-common';
import { countries } from './demo-data';

export class SampleLoginDialog extends Modal {
  form: Form = Form.create({
    email                : Form.email().label('Email').validators(isRequired).placeholder('enter a valid email').onValueChange((form: Form, v: any) => form.setFieldValues({money: 5, password: '123', 'password_confirmation': '123'})).autoFocus(),
    password             : Form.password().label('Password').validators(and(isRequired, isSameAsOther('password_confirmation', 'passwords are not the same'))).placeholder('enter a password'),
    password_confirmation: Form.password().label('Confirm Password').placeholder('confirm your password'),
    country              : Form.reference(countries).label('Country').validators(isRequired).placeholder('type to lookup'),
    time                 : Form.time().label('Time').validators(isRequired).onValueChange((form: Form, v: any) => form.setFieldValue('email', 'hi@hi.com')),
    selectCountry        : Form.select(countries).label('Select Country').validators(isRequired).placeholder('click to select'),
    money                : Form.number().label('Show Me').validators(isRequired).placeholder('The Money'),
    date                 : Form.date().label('Date').validators(isRequired),
    multi                : Form.multistring({rows: 1}).label('Multiline').placeholder('enter multistring').validators(isRequired),
    color                : Form.color().label('Color'),
  });

  constructor() {
    super('Sample Login Dialog');
    this.action('login', this.submit, {type: 'submit', disabled: () => this.form.hasErrors})
        .action('cancel', {color: 'secondary', icon: 'cancel'});
  }

  confirmation = new Modal('Delete entire hard drive?')
    .action('yes', () => (console.log('no way you chose that'), true), { color: 'primary' })
    .action('no');

  submit = async () => {
    console.log('submitting form...');
    await this.form.submit();
    console.log(this.form.value);
    await delay(2000);
    setTimeout(() => this.confirmation.open(), 0);
    console.log('after timeout');
    // await perform login from server
    return true;
  }
}
