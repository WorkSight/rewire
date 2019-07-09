import * as React from 'react';
import {
  Dialog as DialogView,
  Form,
  FormView,
  Modal,
  validator,
  field,
  error,
}                    from 'rewire-ui';
import { delay }     from 'rewire-common';
import { Observe }   from 'rewire-core';
import { countries } from './demo-data';

const confirmation = new Modal('Delete entire hard drive?')
  .action('yes', () => (console.log('no way you chose that'), true), { color: 'primary' })
  .action('no');

class LoginDialog extends Modal {
  form: Form = Form.create((_) => ({
    email                : _.email().label('Email').validators('required').placeholder('enter a valid email'),
    password             : _.password().label('Password').validators('required', validator('==', field('password_confirmation'), error('passwords are not the same'))).placeholder('enter a password'),
    password_confirmation: _.password().label('Confirm Password').placeholder('confirm your password'),
    country              : _.reference(countries).label('AutoComplete Country').validators('required').placeholder('enter a country'),
    time                 : _.time().label('Time').validators('required'),
    selectCountry        : _.select(countries).label('Select Country').validators('required').placeholder('select a country'),
    multiselectCountry   : _.multiselect(countries).label('Multiselect Country').validators('required').placeholder('select countries'),
    money                : _.number().label('Show Me').validators('required').placeholder('The Money'),
    date                 : _.date().label('Date').validators('required'),
    multi                : _.multistring({rows: 1}).label('Multiline').placeholder('enter multiline string').validators('required'),
    color                : _.color().label('Color'),
    phone                : _.phone().label('Phone'),
    mask                 : _.mask({mask: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}).label('MyMask').validators('required').autoFocus(),
    trigger              : _.string().label('Trigger').placeholder('Change me to trigger handler').onValueChange((form: Form, v: any) => {form.setFieldValue('email', 'Triggered!@hotmail.com'); form.setFieldValue('money', 1337); }),
  }), {}, {initialValuesValidationMode: 'all'});

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
const LoginFormView = React.memo(React.forwardRef(({form}: {form: typeof loginDialog.form}) => (
  <Observe render={() => (
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
  )} />
)));

const getLoginTitle = (dialog: Modal): JSX.Element => {
  return <div>Login</div>;
};

export const DialogLoginForm = () => (
  <DialogView dialog={loginDialog} title={getLoginTitle} maxWidth='lg'>
    <LoginFormView form={loginDialog.form} />
  </ DialogView>
);