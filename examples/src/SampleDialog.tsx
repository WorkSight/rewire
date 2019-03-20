import * as React from 'react';
import {
  Dialog,
  Form,
  FormView,
  Modal,
  isRequired,
  and,
  isSameAsOther
}                    from 'rewire-ui';
import { delay }     from 'rewire-common';
import { countries } from './demo-data';

export class SampleModel extends Modal {
  form: Form = Form.create(
    {
      email:                 Form.email().label('Email').validators(isRequired).placeholder('enter a valid email').onValueChange((form: Form, v: any) => form.setFieldValues({ money: 5, password: '123', password_confirmation: '123' })).autoFocus(),
      password:              Form.password().label('Password').validators(and(isRequired, isSameAsOther('password_confirmation', 'passwords are not the same'))).placeholder('enter a password'),
      password_confirmation: Form.password().label('Confirm Password').placeholder('confirm your password'),
      country:               Form.reference(countries).label('Country').validators(isRequired).placeholder('type to lookup'),
      time:                  Form.time().label('Time').validators(isRequired).onValueChange((form: Form, v: any) => form.setFieldValue('email', 'hi@hi.com')),
      selectCountry:         Form.select(countries).label('Select Country').validators(isRequired).placeholder('click to select'),
      money:                 Form.number().label('Show Me').validators(isRequired).placeholder('The Money'),
      date:                  Form.date().label('Date').validators(isRequired),
      multi:                 Form.multistring({ rows: 1 }).label('Multiline').placeholder('enter multistring').validators(isRequired),
      color:                 Form.color().label('Color'),
    }, {
      email:                 'my_email@gmail.com',
      country:               'Albania',
      selectCountry:         'Afghanistan',
      time:                  '10:30',
      password:              '384lalxk#44',
      // password_confirmation: '384lalxk#44', // not providing a matching value causes form validation to fail and Submit button to become disabled
      money:                 '100.50',
      date:                  '2018-03-05',
      multi:                 `this is line 1\r\nthis is line 2\r\nand this is line 3`,
      color:                 '#ffeedd'
    }
  );

  constructor() {
    super('Sample Dialog');
    this.action('submit', this.submit, { type: 'submit', disabled: () => this.form.hasErrors })
        .action('cancel', { color: 'secondary', icon: 'cancel' });
  }

  submit = async () => {
    console.log('submitting form...');
    await this.form.submit();
    console.log(this.form.value);
    await delay(2000);
    console.log('after timeout');
    return true;
  }
}

export const sampleModel = new SampleModel();
const SampleFormView = ({ form }: { form: typeof sampleModel.form }) => (
  <div style={{ fontSize: '16px' }}>
    <FormView form={form} onSubmit={sampleModel.actionFn('submit')}>
      <div className='content'>
        <form.field.email.Editor className='span2' />
        <form.field.country.Editor className='span2' />
      </div>
      <div className='content'>
        <form.field.selectCountry.Editor className='span2' />
        <form.field.time.Editor className='span2' />
      </div>
      <div className='content'>
        <form.field.password.Editor />
        <form.field.password_confirmation.Editor />
      </div>
      <div className='content'>
        <form.field.money.Editor />
        <form.field.date.Editor />
        <form.field.color.Editor />
      </div>
      <div className='content'>
        <form.field.multi.Editor />
      </div>
    </FormView>
  </div>
);

// override title
const getTitle = (dialog: Modal): JSX.Element => <span>Dialog Title</span>;

export const SampleDialog = () => (
  <Dialog dialog={sampleModel} title={getTitle} maxWidth='md'>
    <SampleFormView form={sampleModel.form} />
  </Dialog>
);
