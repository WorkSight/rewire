import * as React            from 'react';
import * as ReactDOM         from 'react-dom';
import {AutoComplete}        from 'rewire-ui';
import {
  arraySearch,
  documentSearch
}                            from 'rewire-ui';
import {Select}              from 'rewire-ui';
import { observable, watch, root } from 'rewire-core';
import {Observe}             from 'rewire-core';
import {fetch}               from 'rewire-common';
// import TextField          from 'material-ui/TextField';
import {TextField}           from 'rewire-ui';
import {NumberField}         from 'rewire-ui';
import Button                from '@material-ui/core/Button';
import Typography            from '@material-ui/core/Typography';
import { withStyles }        from '@material-ui/core/styles';
import {Sortable, SortableList, IItem} from 'rewire-ui';
import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink,
} from 'react-router-dom';
// import {TimeInputField} from 'rewire-ui';
import {utc}            from 'rewire-common';
// import Grid           from './components/Grid';
import Paper          from '@material-ui/core/Paper';
import Dialog         from '@material-ui/core/Dialog';
import ListItem       from '@material-ui/core/ListItem';
import {delay}        from 'rewire-common';
import {Loader}       from 'rewire-ui';
import * as is        from 'is';
import {Form}         from 'rewire-ui';
import { IObject }    from 'rewire-common';
import {Modal}        from 'rewire-ui';
import {Dialog as DialogView}   from 'rewire-ui';
import {FormView}     from 'rewire-ui';
// import column         from './models/Grid';
import {createGrid, createColumn, IError, ErrorSeverity}   from 'rewire-grid';
import {Grid}         from 'rewire-grid';
// import { ICell, collapseAll, expandAll } from 'rewire-grid/models/GridTypes';
import {editor}       from 'rewire-ui';
import {isRequired, isEmail, and, isSameAsOther} from 'rewire-ui';
import './graphqltest';
import doucheSuitDude from './images/doucheSuitDude.jpg';

const suggestions = [
  {name: 'Afghanistan'},
  {name: 'Aland Islands'},
  {name: 'Albania'},
  {name: 'Algeria'},
  {name: 'American Samoa'},
  {name: 'Andorra'},
  {name: 'Angola'},
  {name: 'Anguilla'},
  {name: 'Antarctica'},
  {name: 'Antigua and Barbuda'},
  {name: 'Argentina'},
  {name: 'Armenia'},
  {name: 'Aruba'},
  {name: 'Australia'},
  {name: 'Austria'},
  {name: 'Azerbaijan'},
  {name: 'Bahamas'},
  {name: 'Bahrain'},
  {name: 'Bangladesh'},
  {name: 'Barbados'},
  {name: 'Belarus'},
  {name: 'Belgium'},
  {name: 'Belize'},
  {name: 'Benin'},
  {name: 'Bermuda'},
  {name: 'Bhutan'},
  {name: 'Bolivia, Plurinational State of'},
  {name: 'Bonaire, Sint Eustatius and Saba'},
  {name: 'Bosnia and Herzegovina'},
  {name: 'Botswana'},
  {name: 'Bouvet Island'},
  {name: 'Brazil'},
  {name: 'BLAH'},
  {name: 'British Indian Ocean Territory'},
  {name: 'Brunei Darussalam'},
];

interface IDocument {
  id: string;
  name?: string;
  code?: string;
}

interface IName {
  name: string;
}

const searcher = arraySearch(['Yes', 'No', 'Maybe', 'Uncertain', 'Definitely Not'], (item?) => item || '');
const countries = arraySearch(suggestions, (item?) => (item && item.name) || '');
const state = documentSearch('state');
const city = documentSearch('city');




// const fld   = autoCompleteField<IName>(suggestions, 'Countries', (item?) => (item && item.name) || '');
// const state = autoCompleteField<IDocument>('state', 'State');
// const city  = autoCompleteField<IDocument>('city', 'City', state);
// const name  = textField('Sandy', 'Name');

// setTimeout(() => { name.error = 'error!!'; }, 1000);
// setTimeout(() => { name.enabled = false; }, 3000);
// setTimeout(() => { name.visible = false; }, 5000);
// setTimeout(() => { name.visible = true; }, 7000);
// setTimeout(() => { name.enabled = true; }, 9000);
// setTimeout(() => state.value = 'Douglas', 2000);
// fld.value = 'Brazil';
// watch(() => name.value, () => console.log(name.value));

interface IOoga {
  YesNoValue: string;
  name?     : string;
  country?  : {name: string};
  state?    : IDocument;
  city?     : IDocument;
  money?    : number;
  loading?  : boolean;
  date?     : any;
  open      : boolean;
  time?     : number;
}

interface IUIState {
  disabled?: boolean;
  visible? : boolean;
}

const ooga: IOoga = observable({
  YesNoValue: 'Yes',
  name      : 'Sandy',
  money     : 45,
  open      : false,
  loading   : false
});

// watch(() => ooga.date, () => console.log(ooga.date, utc(ooga.date).toTimestampString()));

const uistate: IUIState = observable({});

setTimeout(() => {
  ooga.YesNoValue = 'BLAH';
}, 4000);

// setTimeout(() => {
//   uistate.disabled = true;
// }, 4000);


const BasicExample = (props: any) => {
  return (
    <Router>
      <div>
        <ul>
          <li><Link to='/'>Home</Link></li>
          <li><Link to='/about'>About</Link></li>
          <li><Link to='/topics'>Topics</Link></li>
        </ul>
        <hr/>
        <Route exact path='/' component={Home}/>
        <Route path='/about' component={About}/>
        <Route path='/topics' component={Topics}/>
      </div>
    </Router>
  );
};

function stateChanged(v: any) {
  ooga.state = v;
}

function cityChanged(v: any) {
  ooga.city = v;
}

const asFloat = (value: (v: number) => void) => (evt: React.ChangeEvent<HTMLInputElement>) => value(parseFloat(evt.target.value));
const asInt   = (evt: React.ChangeEvent<HTMLInputElement>) => parseInt(evt.target.value);
const asText  = (value: (v: string) => void) => (evt: React.ChangeEvent<HTMLInputElement>) => value(evt.target.value);

let updateName = (v?: string) => ooga.name = v;
const suggestions2 = observable(suggestions);
// setTimeout(() => { console.log('here'); suggestions2[0].name = 'error!!'; }, 5000);

class LoginDialog extends Modal {
  form = Form.create({
    email                : Form.email({hasAdornment: true}).label('Email').validators(and(isRequired, isEmail)).placeholder('enter a valid email').autoFocus(),
    password             : Form.password({hasAdornment: true}).label('Password').validators(and(isRequired, isSameAsOther('password_confirmation', 'passwords are not the same'))).placeholder('enter a password'),
    password_confirmation: Form.password({hasAdornment: true}).label('Confirm Password').placeholder('confirm your password'),
    country              : Form.reference(countries).label('Country').validators(isRequired).placeholder('ooga')
  }, {email: 'splace@worksight.net'});

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
  <FormView form={form} onSubmit={loginDialog.actionFn('login')}>
    <div className='content'>
      <form.field.email.Editor className='span2' />
      <form.field.country.Editor className='span4' />
    </div>
    <div className='content'>
      <form.field.password.Editor />
      <form.field.password_confirmation.Editor />
    </div>
  </FormView>
);

// watch(() => loginDialog.form.hasChanges, () => console.log('has changes =', loginDialog.form.hasChanges));
// watch(() => loginDialog.form.hasErrors, () => console.log('has errors =', loginDialog.form.hasErrors));

const getLoginTitle = (dialog: Modal): JSX.Element => {
  return <div>Login</div>;
};

const DialogLoginForm = () => (
  <DialogView dialog={loginDialog} title={getLoginTitle} maxWidth='md'>
    <LoginFormView form={loginDialog.form} />
  </ DialogView>
);

// const testGrid = {
//   rows: observable([] as any[]),
//   columns: [
//     column('product', 'Product', 'text', 'medium'),
//     column('name', 'Name', 'password', 'large'),
//     column('name2', 'Name2', 'number'),
//     column('description', 'Description', {type: 'number', options: {decimals: 2, thousandSeparator: true}}, 'medium'),
//     column('code', 'Code', {type: 'auto-complete', options: countries}, 'large'),
//     column('owner', 'Owner', 'text')
//   ]
// };

// async function loadGrid(delayms: number) {
//   ooga.loading = true;
//   await delay(delayms);
//   testGrid.rows.set(
//     { id: 0, product: 'DevExtreme', owner: 'DevExpress' },
//     { id: 1, product: 'DevExtreme', owner: 'DevExpress', code: {name: 'Aland Islands'} },
//     { id: 2, product: 'DevExtreme Reactive', owner: 'DevExpress' },
//     { id: 3, product: 'DevExtreme', owner: 'DevExpress' },
//     { id: 4, product: 'DevExtreme Reactive', owner: 'DevExpress' },
//     { id: 5, product: 'DevExtreme', owner: 'DevExpress' },
//     { id: 6, product: 'DevExtreme Reactive', owner: 'DevExpress' },
//     { id: 7, product: 'DevExtreme', owner: 'DevExpress' },
//     { id: 8, product: 'DevExtreme Reactive', owner: 'DevExpress' },
//     { id: 9, product: 'DevExtreme', owner: 'DevExpress' },
//     { id: 10, product: 'DevExtreme', owner: 'DevExpress' },
//   );
//   ooga.loading = false;
// }

// loadGrid(0);
// // setTimeout(() => {
//   console.log(JSON.stringify(testGrid.rows));
//   loadGrid(3500 );
// }
//   , 10000);
// loadGrid(6500);

// setTimeout(() => testGrid.rows.push({id: 4, product: 'goober', owner: 'me'}), 4000);
// setTimeout(() => testGrid.rows.push({id: 5, product: 'goober2', owner: 'me2'}), 8000);
// setTimeout(() => testGrid.columns.push({name: 'ooga', title: 'The Ooga'}), 4000);
// setTimeout(() => testGrid.rows.push({id: 6, product: 'goober2', owner: 'me2'}), 10000);
// setTimeout(() => testGrid.rows[0].product = 'ooga', 6000);
// setTimeout(() => testGrid.rows[3].product = 'ooga', 12000);

const items1 = {id: '1000', items: observable([])};
const items2 = {id: '1001', items: observable([])};
const items3 = {id: '1002', items: observable([])};

function createItems(items: any[], n: number, y: number = 1) {
  for (let x = 0; x < n; x++) {
    let id = x + y;
    items.push({id: '' + id, name: `item ${id.toFixed(2)}`});
  }
}

setTimeout(() => (items1 as any).items[0].name = 'ooga', 3000);

createItems(items1.items, 15);
createItems(items2.items, 15, 50);
createItems(items3.items, 15, 90);

const items4 = observable([items1, items2, items3]);

// watch(() => items1.items.length, () => console.log('test has changed'));

const confirmation = new Modal('Delete entire hard drive?')
  .action('yes', () => (console.log('no way you chose that'), true), {color: 'primary'})
  .action('no');

function createTestGrid(nRows: number, nColumns: number) {
  console.time('start tester');
  // make sure we have enough columns passed.
  if (nColumns < 10) throw new Error('add some more columns!');

  // create some random sized columns!
  let cols = [];
  for (let col = 0; col < nColumns; col++) {
    cols.push(createColumn('column' + col, 'Header# ' + col, 'text', Math.trunc(Math.random() * 250 + 50) + 'px'));
  }
  cols.push(createColumn('numberColumn', 'Number', {type: 'number', options: {decimals: 2, thousandSeparator: false}}, Math.trunc(Math.random() * 250 + 50) + 'px'));
  cols.push(createColumn('timeColumn', 'Time', 'time', Math.trunc(Math.random() * 250 + 50) + 'px'));
  cols.push(createColumn('autoCompleteColumn', 'Auto Complete', {type: 'auto-complete', options: countries}, Math.trunc(Math.random() * 250 + 50) + 'px'));
  cols.push(createColumn('selectColumn', 'Select', {type: 'select', options: countries}, Math.trunc(Math.random() * 250 + 50) + 'px'));
  cols.push(createColumn('checkedColumn', 'Checked', 'checked', Math.trunc(Math.random() * 250 + 50) + 'px'));

  // Override and set some columns to be number!
  cols[5].setEditor({type: 'number', options: {decimals: 2, thousandSeparator: true}});
  cols[5].validator = (value: any): IError | undefined => {
    if (value === undefined) {
      return undefined;
    }

    let error: IError | undefined;
    let errorMsg: string             = '';
    let errorSeverity: ErrorSeverity = ErrorSeverity.error;
    if (value < 2000) {
      errorMsg      = 'Less than 2000';
      errorSeverity = ErrorSeverity.warning;
    } else if (value > 7000) {
      errorMsg      = 'Greater than 7000';
      errorSeverity = ErrorSeverity.critical;
    } else if (value > 4000) {
      errorMsg      = 'Greater than 4000';
      errorSeverity = ErrorSeverity.error;
    } else if (value >= 2000 && value <= 4000) {
      errorMsg      = 'Between 2000 and 4000';
      errorSeverity = ErrorSeverity.info;
    }

    error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;

    return error;
  };
  cols[6].setEditor({type: 'number', options: {decimals: 3, thousandSeparator: true}});

  // add some cell data!
  let rows = [];
  for (let row = 0; row < nRows; row++) {
    let r: any = {id: row, options: {allowMergeColumns: true}};
    for (let column = 0; column < cols.length; column++) {
      let v: any  = `RC ${column}-${row % 5}`;
      let colName = cols[column].name;
      if ((colName === 'autoCompleteColumn') || (colName === 'selectColumn')) v = {name: 'Austria'};
      else if (colName === 'checkedColumn') v = true;
      else if (colName === 'timeColumn') v = '7:30';
      else if (((column >= 5) && (column <= 6)) || colName === 'numberColumn') v = Math.random() * 10000;
      r[colName] = v;
    }
    rows.push(r);
  }
  // Some fixed columns to the left
  cols[0].fixed   = true;
  cols[0].width   = '128px';
  cols[0].align   = 'right';
  cols[1].fixed   = true;
  cols[1].width   = '65px';
  cols[1].align   = 'right';
  cols[4].canSort = false;

  // create the grid model and group by 'column2' and 'column3'
  let grid = createGrid(rows, cols, ['column2', 'column3']);
  grid.fixedRows[0].cells['column5'].value = 'Sales';
  grid.fixedRows[0].cells['column6'].value = 'Sales';
  grid.addFixedRow({column5: '2017', column6: '2018'});
  grid.multiSelect = true;

  // sort first by  column7 then by column6
  grid.addSort(cols[7], 'ascending')
      .addSort(cols[6], 'descending');

  console.timeEnd('start tester'); // how long did it take to create the reactive model?
  return grid;
}

let grid = createTestGrid(40, 14);

let rrr = {column0: 'booga'};
grid.cell('3', 'column8')!.value = 'oga booga boa';
const r = grid.get();
console.log(r);
// setTimeout(() => grid.rows.length = 0, 4000);
// setTimeout(() => grid.set(r), 3000);
// setTimeout(() => expandAll(grid), 6000);
// setTimeout(() => S.freeze(() => grid.addRow(rrr)), 5000);
// setTimeout(() => grid.rows[0].cells['column0'].value = 'booga', 6000);
// setTimeout(() => grid.columns[3].visible = false, 7000);
// setTimeout(() => grid.columns[3].visible = true, 8000);

// watch(() => {
//   let r = grid.hasChanges();
// }, () => console.log('has changes', grid.hasChanges()));

function createEmployeesGrid() {
  let employees = [
    {id: '1e',  name: 'Schrute, Dwight',         email: 'testEmail11@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: undefined        , selectColumn: {name: 'Bermuda'}},
    {id: '2e',  name: 'Scott, Michael',          email: 'testEmail22@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '3e',  name: 'Lannister, Jaime',        email: 'testEmail33@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '4e',  name: 'Dayne, Arthur',           email: 'testEmail44@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '5e',  name: 'Snow, Jon',               email: 'testEmail55@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '6e',  name: 'Stark, Ned',              email: 'testEmail66@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '7e',  name: 'Stark, Arya',             email: 'testEmail77@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '8e',  name: 'Biggus, Headus',          email: 'testEmail88@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '9e',  name: 'Drumpf, Donald',          email: 'testEmail99@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '7e',  name: 'Johnson, Ruin',           email: 'testEmail00@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '8e',  name: 'Ren, Emo',                email: 'testEmail1234@test.com',     isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '9e',  name: 'Swolo, Ben',              email: 'testEmail5678@test.com',     isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '10e', name: 'Sue, Mary',               email: 'testEmail90210@test.com',    isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '11e', name: 'Poppins, Leia',           email: 'testEmail6274309@test.com',  isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '12e', name: 'Snoke, Nobody',           email: 'testEmail13371337@test.com', isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
    {id: '13e', name: 'Too tired to live, Luke', email: 'testEmail253545@test.com',   isActive: true, timeColumn: '7:30', autoCompleteColumn: {name: 'Bermuda'}, selectColumn: {name: 'Bermuda'}},
  ];

  let cols = [];

  // add header columns
  cols.push(createColumn('name',     'Employee', 'text'));
  cols.push(createColumn('email',    'Email',    'text'));
  cols.push(createColumn('isActive', 'IsActive', 'checked'));
  cols.push(createColumn('timeColumn', 'Time', 'time'));
  cols.push(createColumn('autoCompleteColumn', 'Auto Complete', {type: 'auto-complete', options: countries}));
  cols.push(createColumn('selectColumn', 'Select', {type: 'select', options: countries}));

  cols[1].readOnly = true;

  // add employee rows
  let rows: any[] = [];
  for (let row = 0; row < employees.length; row++) {
    let r: any = {id: row};
    for (let column = 0; column < cols.length; column++) {
      let fieldName: string = cols[column].name;
      if (fieldName === 'name') {
        r[fieldName] = employees[row][fieldName]; // somehow make into a button that opens a dialog on click???
      } else {
        r[fieldName] = employees[row][fieldName];
      }
    }
    rows.push(r);
  }

  // create the grid model
  let grid = createGrid(rows, cols);
  // sort by employee names
  grid.multiSelect = true;
  grid.addSort(cols[0], 'ascending');

  return grid;
}

let employeesGrid = createEmployeesGrid();

const _Home = (props: any) => (
  <div>
    <div>
      <Button color='primary' variant='raised' onClick={() => loginDialog.open()}>Load Dialog Test</Button>
      <LoginFormView form={loginDialog.form} />
      <DialogLoginForm />
      <DialogView dialog={confirmation}>
        <Typography style={{margin: 16}}>Are you sure you want to do this crazy shit?</Typography>
      </DialogView>
      <div style={{overflow: 'auto', padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <Paper style={{width: '80%', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 800}}>
          <Grid grid={grid} gridFontSizes={{header: '0.9rem', body: '0.9rem', groupRow: '0.8rem'}} />
        </Paper>
        <Paper style={{width: '80%', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400}}>
          <Grid grid={employeesGrid} gridFontSizes={{header: '0.95rem', body: '0.9rem', groupRow: '0.8rem'}} />
        </Paper>
      </div>
    </div>
  </div>
);

const Home = _Home;

class TestDialog extends Modal {
  form = Form.create({
    date                 : Form.date().label('Date').validators(isRequired).placeholder(utc().toDateString()).autoFocus(),
    age                  : Form.number().label('Age').placeholder(''),
    shouldI              : Form.select(searcher).label('Should I?').validators(isRequired),
    isGreat              : Form.boolean().label('Is Great'),
    noLabel              : Form.boolean(),
    disabled             : Form.boolean().label('Disabled').disabled(() => true),
    email                : Form.email({hasAdornment: true}).label('Email').validators(isRequired).placeholder('enter a valid email'),
    password             : Form.password({hasAdornment: true}).label('Password').validators(and(isRequired, isSameAsOther('password_confirmation', 'passwords are not the same'))).placeholder('enter a password'),
    password_confirmation: Form.password({hasAdornment: true}).label('Confirm Password').placeholder('confirm your password'),
    country              : Form.reference(countries).label('Country').validators(isRequired),
    avatar               : Form.avatar({width: 1000, height: 1000, avatarDiameter: 150, cropRadius: 75}).label('Add Photo'),
  }, {email: 'splace@worksight.net', isGreat: true, avatar: doucheSuitDude});

  constructor() {
    super('Test Form');
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

const testDialog = new TestDialog();
const TestFormView = ({form}: {form: typeof testDialog.form}) => (
  <FormView form={form} onSubmit={testDialog.actionFn('login')}>
    <div className='content'>
      <form.field.date.Editor className='span4' />
      <form.field.age.Editor className='span4' />
      <form.field.shouldI.Editor className='span4' />
      <form.field.isGreat.Editor className='span4' />
    </div>
    <div className='content'>
      <form.field.noLabel.Editor className='span4' />
      <form.field.disabled.Editor className='span4' />
      <form.field.email.Editor className='span4' />
    </div>
    <div className='content'>
      <form.field.password.Editor />
      <form.field.password_confirmation.Editor />
    </div>
    <div className='content'>
      <form.field.country.Editor className='span4' />
    </div>
    <div className='content'>
    <form.field.avatar.Editor />
    </div>
    <div className='content'>
      <button style={{height: '30px'}}  value='Submit' onClick={testDialog.actionFn('login')}>Submit</button>
      <button style={{height: '30px'}}  value='Cancel' onClick={testDialog.actionFn('cancel')}>Cancel</button>
    </div>
  </FormView>
);


const About = (props: any) => (
  <div>
    <h2>About</h2>
    <TestFormView form={testDialog.form} />
  </div>
);

let sortableItems: IItem[] = observable([
  {id: '1item', name: 'First Item'},
  {id: '2item', name: 'Second Item'},
  {id: '3item', name: 'Third Item'},
  {id: '4item', name: 'Fourth Item'},
]);

const sortableItemRenderer = (item: IItem): JSX.Element => {
  return (
    <ListItem key={item.id} component={NavLink} to={`/topics/props-v-state`} activeClassName={'activeLink'}>
      <Typography>{item.name}</Typography>
    </ListItem>
  );
};

const Topics = ({ match }: any) => (
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>
          Rendering with React
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>
          Components
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>
          Props v. State
        </Link>
      </li>
    </ul>


    <Paper style={{width: '40%', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400}}>
      <Sortable>
        <SortableList listId='myList' items={sortableItems} itemRenderer={sortableItemRenderer} showDragHandle={false} disableTabbing={true} />
      </Sortable>
    </Paper>

    <Route path={`${match.url}/:topicId`} component={Topic}/>
    <Route exact path={match.url} render={() => (
      <h3>Please select a topic.</h3>
    )}/>
  </div>
);

const Topic = ({ match }: any) => (
  <div>
    <h3>{match.params.topicId}</h3>
  </div>
);

async function login() {
  // await fetch.post('accounts/login', { username: 'Administrator', password: 'eblenglo' });
  ReactDOM.render(<BasicExample />, document.getElementById('root'));
}

let id = 0;
class Test {
  id: number = id++;
  enabled    = true;
  rows       = [];
  headers    = [];
  loading    = false;
  width      = 'calc(100vh - 260px)';
  height     = '1600px';
  fixedWidth = '180px';
  isDraggable: boolean = false;
  constructor() {

  }
}


login();

export default BasicExample;