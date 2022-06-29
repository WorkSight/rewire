import React from 'react';
import {
  Form,
  FormView,
  Modal,
  ISuggestionsContainerComponentProps,
  field,
  error,
  validator
}                    from 'rewire-ui';
import { Observe }   from 'rewire-core';
import { delay }     from 'rewire-common';
import Typography    from '@material-ui/core/Typography';
import Button        from '@material-ui/core/Button';
import { countries, searcher }      from './demo-data';
import { DraggableResizableDialog } from 'rewire-ui';

const clickHandler = (props: ISuggestionsContainerComponentProps) => () => {
  console.log('Add Item!');
  props.downShift.closeMenu();
};

const suggestionsContainerHeader = (_props: ISuggestionsContainerComponentProps) => (
  <div>
    <Typography variant='subtitle1'><strong>Items Title</strong></Typography>
  </div>
);

const suggestionsContainerFooter = (props: ISuggestionsContainerComponentProps) => (
  <div>
    <Button variant='contained' size='small' onClick={clickHandler(props)}>Add Item</Button>
  </div>
);

const CustomEditor = (props: any) => {
  return <span>{props.value}</span>;
};

function createForm() {
  return Form.create((_) => ({
    email:                   _.email().label('Email').validators('email').placeholder('enter a valid email').autoFocus().tooltip((value) => `Email: ${value}`),
    custom2:                 _.custom(CustomEditor).label('OOGA').placeholder('enter a valid email'),
    password:                _.password().label('Password').validators('required', validator('==', field('password_confirmation'), error('passwords must be the same'))).placeholder('enter a password'),
    password_confirmation:   _.password().label('Confirm Password').validators('required').placeholder('confirm your password'),
    country:                 _.reference(countries).label('Country').validators('required').placeholder('type to lookup'),
    time:                    _.time().label('Time').validators('required').onValueChange((form: Form, _v: any) => form.setFieldValue('email', 'hi@hi.com')),
    multiselectAutoComplete: _.multiselectautocomplete(countries, { chipLimit: 2, inputAdd: (v: string) => ({id: v, name: v}) }).label('Multiselect AutoComplete Country').validators('required').placeholder('select all that apply'),
    searchers:               _.multiselectautocomplete(searcher, { chipLimit: 2, inputAdd: (v: string) => v}).label('Multiselect AutoComplete Searcher').validators('required').placeholder('select all that apply'),
    multiselectCountry:      _.multiselect(countries).label('Multiselect Country').validators('required').placeholder('select countries'),
    selectCountry:           _.select(countries).label('Select Country').validators('required').placeholder('click to select'),
    money:                   _.number().label('Show Me').validators('required').placeholder('The Money'),
    date:                    _.date().label('Date').validators('required'),
    startValue:              _.number().label('Start Number').validators(validator('<', field('endValue'))),
    endValue:                _.number().label('End Number'),
    custom:                  _.number().label('> 10').validators((a) => a ? a > 10 : true),
    multi:                   _.multistring({ rows: 1 }).label('Multiline').placeholder('enter multistring').validators('required'),
    color:                   _.color().label('Color'),
    phone:                   _.phone().label('Phone').accessor(['phone', 'home']),
    mask:                    _.mask({mask: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}).label('MyMask').validators('required'),
    trigger:                 _.string().label('Trigger').placeholder('Change me to trigger handler').onValueChange((form: Form, _v: any) => {form.setFieldValue('email', 'Triggered!@hotmail.com'); form.setFieldValue('money', 1337); }),
    advancedAutoComplete:    _.reference(countries, { suggestionsContainerHeader: suggestionsContainerHeader, suggestionsContainerFooter: suggestionsContainerFooter, openOnFocus: true }).label('Advanced AutoComplete').validators('required').placeholder('select a country'),
  }), {
    email:                 'my_email@gmail.com',
    custom2:               'my_email@gmail.com',
    country:               {id: 2, name: 'Albania'},
    selectCountry:         {id: 0, name: 'Afghanistan'},
    time:                  '10:30',
    password:              '384lalxk#44',
    // password_confirmation: '384lalxk#44', // not providing a matching value causes form validation to fail and Submit button to become disabled
    money:                 '100.50',
    date:                  '2018-03-05',
    phone:                 {home: '123123233'},
    multi:                 `this is line 1\r\nthis is line 2\r\nand this is line 3`,
    color:                 '#ffeedd',
    multiselectAutoComplete: [{ id: '0', name: 'Afghanistan' }, { id: '23', name: 'Benin' }, { id: '24', name: 'Bermuda' }],
    advancedAutoComplete: {id: 0, name: 'Afghanistan'},
  }
);
}

export class SampleModel extends Modal {
  form = createForm();

  constructor() {
    super('Sample Dialog');
    this.action('login', this.submit, { type: 'submit', disabled: () => this.form.hasErrors || !this.form.hasChanges })
        .action('cancel', { color: 'secondary', icon: 'cancel' });
  }

  submit = async () => {
    if (!this.form.submit()) return false;
    console.log(this.form.value);
    await delay(2000);
    return true;
  };
}

export const sampleModel = new SampleModel();
// setInterval(() => {
//   if (sampleModel.form.fields.find(f => f.name === 'dynamic_field')) {
//     sampleModel.form.removeFields(['dynamic_field']);
//     return;
//   }

//   sampleModel.form.addFields((_) => ({
//     dynamic_field: _.string().label('Dynamic Field').placeholder('dynamic field!')
//   }), {dynamic_field: 'ooga'});
// }, 5000);

const SampleFormView = React.memo(({ form }: { form: typeof sampleModel.form }) => (
  <Observe render={() => (
    <div style={{ fontSize: '16px' }}>
      <FormView form={form} onSubmit={sampleModel.actionFn('login')}>
        <div className='content'>
          <form.field.email.Editor />
          <form.field.custom2.Editor />
          <form.field.country.Editor />
          <form.field.selectCountry.Editor />
          <form.field.multiselectCountry.Editor className='span2' />
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
          <form.field.advancedAutoComplete.Editor />
        </div>
        <div className='content'>
          <form.field.multiselectAutoComplete.Editor />
          <form.field.searchers.Editor />
          {/* <Observe render={() => (
            <>
              {!form.field.dynamic_field ? null : <form.field.dynamic_field.Editor />}
              {!form.field.dynamic_field ? null : <form.field.dynamic_field.Editor />}
            </>
          )} /> */}
          </div>
      </FormView>
    </div>
  )} />
));

// override title
const getTitle = (_dialog: Modal): JSX.Element => <span>Dialog Title</span>;

export const SampleDialog = () => (
  <DraggableResizableDialog defaultWidth='lg' DialogProps={{dialog: sampleModel, title: getTitle}}>
    <SampleFormView form={sampleModel.form} />
  </DraggableResizableDialog>
);
