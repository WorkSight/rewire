import * as React              from 'react';
import { delay }               from 'rewire-common';
import { countries, searcher } from './demo-data';
import { Observe }             from 'rewire-core';
import {
  Form,
  FormView,
  Modal,
  TransitionWrapper,
  isRequired,
  and,
  isSameAsOther,
  isDifferenceOfOthers,
  isSumOfOthers,
  isLessThan,
  requiredWhenOtherIsNotNull,
  requiredWhenOtherIsValue
}                        from 'rewire-ui';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import AddIcon           from '@material-ui/icons/Add';
import Button            from '@material-ui/core/Button';

import './graphqltest';

const confirmation = new Modal('Please confirm your request')
  .action('yes', () => (console.log('I beg to differ, but its your choice'), true), { color: 'primary' })
  .action('no');

class TestDialog extends Modal {
  constructor() {
    super('Test Form');
    this.action('login', this.submit, {type: 'submit', disabled: () => !this.form.hasChanges})
        .action('cancel', {color: 'secondary', icon: 'cancel'});
  }

  submit = async () => {
    console.log('submitting...');
    await this.form.submit();
    console.log(this.form.value);
    await delay(2000);
    setTimeout(() => confirmation.open(), 0);
    return true;
  }

  form = Form.create({
    date                 : Form.date().label('Date').validators(isRequired).autoFocus(),
    dollars              : Form.number().label('Dollars').validators(isRequired).placeholder('Show me the money').startAdornment(() => <div style={{display: 'flex', alignItems: 'center'}}><AddIcon /><span>$</span></div>),
    shouldI              : Form.multiselect(searcher).label('Should I?').placeholder('choose!').startAdornment(() => <AccessibilityIcon />).validators(isRequired),
    isGreat              : Form.boolean().label('Is Great'),
    noLabel              : Form.boolean(),
    disabled             : Form.boolean().label('Disabled').disabled(() => true),
    email                : Form.email().label('Email').validators(requiredWhenOtherIsValue('name', 'Ryan')).placeholder('enter a valid email'),
    name                 : Form.string().label('Name').validators(isRequired).placeholder('enter your name').startAdornment(() => <AccessibilityIcon />),
    password             : Form.password().label('Password').validators(and(isRequired, isSameAsOther('password_confirmation', 'passwords are not the same'))).placeholder('enter a password').updateOnChange(),
    password_confirmation: Form.password().label('Confirm Password').placeholder('confirm your password').updateOnChange(),
    phone                : Form.phone().label('Phone Number (optional)').placeholder('your phone number'),
    phoneCustom          : Form.phone({format: '#-##-###-####-#####'}).label('Phone Number Custom (optional)').placeholder('your phone number'),
    country              : Form.reference(countries).label('Country').placeholder('pick a country').startAdornment(() => <AccessibilityIcon />).validators(isRequired),
    timeOut              : Form.time().label('Time Out').placeholder('enter a time').validators(and(isRequired, isLessThan('timeIn'))),
    timeIn               : Form.time().label('Time In').placeholder('enter a time').validators(requiredWhenOtherIsNotNull('timeOut')),
    difference           : Form.number().label('Time Difference').placeholder('enter difference').validators(isDifferenceOfOthers(['timeIn', 'timeOut'])),
    sum                  : Form.number().label('Time Sum').placeholder('enter sum').validators(isSumOfOthers(['timeIn', 'timeOut'])),
    avatar               : Form.avatar({width: 1000, height: 1000, avatarDiameter: 150, cropRadius: 75}).label('Add Photo (Optional)'),
    multi                : Form.multistring().validators(isRequired).placeholder('enter some multiline text').startAdornment(() => <AccessibilityIcon />).endAdornment(() => <AddIcon />),
    switch1              : Form.switch().label('Switch 1'),
    switch2              : Form.switch().label('Switch 2'),
    color                : Form.color().disabled(() => false).label('Colour picker'),
  }, {email: 'splace@worksight.net', isGreat: true, switch2: true, phone: '34232221535'}, {variant: 'outlined', initialValuesValidationMode: 'withValues'});
}

const testDialog   = new TestDialog();
const TestFormView = ({form}: {form: typeof testDialog.form}) => (
  <Observe render={() => (
    <TransitionWrapper>
    <div style={{fontSize: '16px'}}>
    <FormView form={form} onSubmit={testDialog.actionFn('login')}>
      <div className='content'>
        <form.field.date.Editor    className='span4' />
        <form.field.dollars.Editor className='span4' />
        <form.field.shouldI.Editor className='span4' />
      </div>
      <div className='content'>
        <form.field.noLabel.Editor  className='span4' />
        <form.field.disabled.Editor className='span4' />
        <form.field.email.Editor    className='span4' />
        <form.field.name.Editor     className='span4' />
      </div>
      <div className='content'>
        <form.field.password.Editor />
        <form.field.password_confirmation.Editor />
        <form.field.phone.Editor />
        <form.field.phoneCustom.Editor />
      </div>
      <div className='content'>
        <form.field.timeOut.Editor className='span4' />
        <form.field.timeIn.Editor  className='span4' />
        <form.field.isGreat.Editor className='span4' />
      </div>
      <div className='content'>
        <form.field.difference.Editor className='span1' />
        <form.field.sum.Editor        className='span1' />
        <form.field.multi.Editor      className='span1' />
      </div>
      {/* <Slide in={true} timeout={2000} direction='up' mountOnEnter unmountOnExit> */}
      <div className='content'>
        <form.field.switch1.Editor className='span1' />
        <form.field.switch2.Editor className='span1' />
        <form.field.color.Editor   className='span1' />
        <form.field.country.Editor className='span4' />
      </div>
      {/* </Slide> */}
      <div className='content'>
        <form.field.avatar.Editor />
      </div>
      <div className='content'>
        <Button style={{height: '30px'}} value='Submit' variant='contained' onClick={testDialog.actionFn('login')}>Submit</Button>
        <Button style={{height: '30px'}} value='Cancel' variant='contained' onClick={testDialog.actionFn('cancel')}>Cancel</Button>
      </div>
    </FormView>
    </div>
    </TransitionWrapper>
  )} />
);

export const AboutView = (props: any) => (
  <div>
    <h2>About</h2>
    <TestFormView form={testDialog.form} />
  </div>
);

