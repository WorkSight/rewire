import * as React from 'react';
import {
  Dialog as DialogView,
  Form,
  FormView,
  Modal,
  isRequired,
  and,
  isSameAsOther
}                    from 'rewire-ui';
import { delay }     from 'rewire-common';
import { countries } from './demo-data';

const confirmation = new Modal('Delete entire hard drive?')
  .action('yes', () => (console.log('no way you chose that'), true), { color: 'primary' })
  .action('no');

class LoginDialog extends Modal {
  form: Form = Form.create({
    email                : Form.email().label('Email').validators(isRequired).placeholder('enter a valid email'),
    password             : Form.password().label('Password').validators(and(isRequired, isSameAsOther('password_confirmation', 'passwords are not the same'))).placeholder('enter a password'),
    password_confirmation: Form.password().label('Confirm Password').placeholder('confirm your password'),
    country              : Form.reference(countries).label('AutoComplete Country').validators(isRequired).placeholder('enter a country'),
    time                 : Form.time().label('Time').validators(isRequired),
    selectCountry        : Form.select(countries).label('Select Country').validators(isRequired).placeholder('select a country'),
    multiselectCountry   : Form.multiselect(countries).label('Multiselect Country').validators(isRequired).placeholder('select countries'),
    money                : Form.number().label('Show Me').validators(isRequired).placeholder('The Money'),
    date                 : Form.date().label('Date').validators(isRequired),
    multi                : Form.multistring({rows: 1}).label('Multiline').placeholder('enter multiline string').validators(isRequired),
    color                : Form.color().label('Color'),
    phone                : Form.phone().label('Phone'),
    mask                 : Form.mask({mask: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}).label('MyMask').validators(isRequired).autoFocus(),
    trigger              : Form.string().label('Trigger').placeholder('Change me to trigger handler').onValueChange((form: Form, v: any) => {form.setFieldValue('email', 'Triggered!@hotmail.com'); form.setFieldValue('money', 1337); }),
  }, {}, {initialValuesValidationMode: 'all'});

  constructor() {
    super('');
    this.action('login', this.submit, {type: 'submit', disabled: () => this.form.hasErrors})
        .action('cancel', {color: 'secondary', icon: 'cancel'});
  }

  submit = async () => {
    if (!this.form.submit()) return false;
    console.log(this.form.value);
    await delay(2000);
    setTimeout(() => confirmation.open(), 0);
    // await perform login from server
    return true;
  }
}

const loginDialog = new LoginDialog();
const LoginFormView = ({form}: {form: typeof loginDialog.form}) => (
  <div style={{fontSize: '16px'}}>
  <FormView form={form} onSubmit={loginDialog.actionFn('login')}>
    <div className='content'>
      <form.field.email.Editor />
      <form.field.country.Editor />
      <form.field.selectCountry.Editor />
      <form.field.multiselectCountry.Editor />
    </div>
    <div className='content'>
      <form.field.password.Editor />
      <form.field.password_confirmation.Editor />
      <form.field.money.Editor />
      <form.field.phone.Editor />
      <form.field.mask.Editor />
    </div>
    <div className='content'>
      <form.field.date.Editor />
      <form.field.time.Editor />
      <form.field.multi.Editor />
      <form.field.trigger.Editor />
      <form.field.color.Editor />
    </div>
  </FormView>
  </div>
);

const getLoginTitle = (dialog: Modal): JSX.Element => {
  return <div>Login</div>;
};

export const DialogLoginForm = () => (
  <DialogView dialog={loginDialog} title={getLoginTitle} maxWidth='lg'>
    <LoginFormView form={loginDialog.form} />
  </ DialogView>
);