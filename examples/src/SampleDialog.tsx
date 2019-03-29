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
      email:                   Form.email().label('Email').validators(isRequired).placeholder('enter a valid email').autoFocus(),
      password:                Form.password().label('Password').validators(and(isRequired, isSameAsOther('password_confirmation', 'passwords are not the same'))).placeholder('enter a password'),
      password_confirmation:   Form.password().label('Confirm Password').placeholder('confirm your password'),
      country:                 Form.reference(countries).label('Country').validators(isRequired).placeholder('type to lookup'),
      time:                    Form.time().label('Time').validators(isRequired).onValueChange((form: Form, v: any) => form.setFieldValue('email', 'hi@hi.com')),
      multiselectAutoComplete: Form.multiselectautocomplete(countries, { chipLimit: 2 }).label('Multiselect AutoComplete Country').validators(isRequired).placeholder('select all that apply'),
      multiselectCountry:      Form.multiselect(countries).label('Multiselect Country').validators(isRequired).placeholder('select countries'),
      selectCountry:           Form.select(countries).label('Select Country').validators(isRequired).placeholder('click to select'),
      money:                   Form.number().label('Show Me').validators(isRequired).placeholder('The Money'),
      date:                    Form.date().label('Date').validators(isRequired),
      multi:                   Form.multistring({ rows: 1 }).label('Multiline').placeholder('enter multistring').validators(isRequired),
      color:                   Form.color().label('Color'),
      phone:                   Form.phone().label('Phone'),
      mask:                    Form.mask({mask: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}).label('MyMask').validators(isRequired),
      trigger:                 Form.string().label('Trigger').placeholder('Change me to trigger handler').onValueChange((form: Form, v: any) => {form.setFieldValue('email', 'Triggered!@hotmail.com'); form.setFieldValue('money', 1337); }),
    }, {
      email:                 'my_email@gmail.com',
      country:               {id: 2, name: 'Albania'},
      selectCountry:         {id: 0, name: 'Afghanistan'},
      time:                  '10:30',
      password:              '384lalxk#44',
      // password_confirmation: '384lalxk#44', // not providing a matching value causes form validation to fail and Submit button to become disabled
      money:                 '100.50',
      date:                  '2018-03-05',
      multi:                 `this is line 1\r\nthis is line 2\r\nand this is line 3`,
      color:                 '#ffeedd',
      multiselectAutoComplete: [{ id: '0', name: 'Afghanistan' }, { id: '23', name: 'Benin' }, { id: '24', name: 'Bermuda' }]
    }, {initialValuesValidationMode: 'all'}
  );

  constructor() {
    super('Sample Dialog');
    this.action('login', this.submit, { type: 'submit', disabled: () => this.form.hasErrors })
        .action('cancel', { color: 'secondary', icon: 'cancel' });
  }

  submit = async () => {
    if (!this.form.submit()) return false;
    console.log(this.form.value);
    await delay(2000);
    return true;
  }
}

export const sampleModel = new SampleModel();
const SampleFormView = ({ form }: { form: typeof sampleModel.form }) => (
  <div style={{ fontSize: '16px' }}>
    <FormView form={form} onSubmit={sampleModel.actionFn('login')}>
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
      <div className='content'>
        <form.field.multiselectAutoComplete.Editor />
      </div>
    </FormView>
  </div>
);

// override title
const getTitle = (dialog: Modal): JSX.Element => <span>Dialog Title</span>;

export const SampleDialog = () => (
  <Dialog dialog={sampleModel} title={getTitle} maxWidth='lg'>
    <SampleFormView form={sampleModel.form} />
  </Dialog>
);
