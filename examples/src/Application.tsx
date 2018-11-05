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
import AddIcon               from '@material-ui/icons/Add';
import AccessibilityIcon     from '@material-ui/icons/Accessibility';
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
import {Form, IFormOptions}         from 'rewire-ui';
import { IObject }    from 'rewire-common';
import {Modal}        from 'rewire-ui';
import {Dialog as DialogView}   from 'rewire-ui';
import {FormView}     from 'rewire-ui';
// import column         from './models/Grid';
import {createGrid, createColumn, IError, ErrorSeverity}   from 'rewire-grid';
import {Grid, ICell}         from 'rewire-grid';
// import { ICell, collapseAll, expandAll } from 'rewire-grid/models/GridTypes';
import {editor}       from 'rewire-ui';
import {isRequired, isEmail, and, isSameAsOther} from 'rewire-ui';
import './graphqltest';
import doucheSuitDude from './images/doucheSuitDude.jpg';
import { MuiThemeProvider, Theme, createMuiTheme } from '@material-ui/core/styles';

const suggestions = [
  {id: '0', name: 'Afghanistan'},
  {id: '1', name: 'Aland Islands'},
  {id: '2', name: 'Albania'},
  {id: '3', name: 'Algeria'},
  {id: '4', name: 'American Samoa'},
  {id: '5', name: 'Andorra'},
  {id: '6', name: 'Angola'},
  {id: '7', name: 'Anguilla'},
  {id: '8', name: 'Antarctica'},
  {id: '9', name: 'Antigua and Barbuda'},
  {id: '10', name: 'Argentina'},
  {id: '11', name: 'Armenia'},
  {id: '12', name: 'Aruba'},
  {id: '13', name: 'Australia'},
  {id: '14', name: 'Austria'},
  {id: '15', name: 'Azerbaijan'},
  {id: '16', name: 'Bahamas'},
  {id: '17', name: 'Bahrain'},
  {id: '18', name: 'Bangladesh'},
  {id: '19', name: 'Barbados'},
  {id: '20', name: 'Belarus'},
  {id: '21', name: 'Belgium'},
  {id: '22', name: 'Belize'},
  {id: '23', name: 'Benin'},
  {id: '24', name: 'Bermuda'},
  {id: '25', name: 'Bhutan'},
  {id: '26', name: 'Bolivia, Plurinational State of'},
  {id: '27', name: 'Bonaire, Sint Eustatius and Saba'},
  {id: '28', name: 'Bosnia and Herzegovina'},
  {id: '29', name: 'Botswana'},
  {id: '30', name: 'Bouvet Island'},
  {id: '31', name: 'Brazil'},
  {id: '32', name: 'BLAH'},
  {id: '33', name: 'British Indian Ocean Territory'},
  {id: '34', name: 'Brunei Darussalam'},
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
    email                : Form.email().label('Email').validators(isRequired).placeholder('enter a valid email').autoFocus(),
    password             : Form.password().label('Password').validators(and(isRequired, isSameAsOther('password_confirmation', 'passwords are not the same'))).placeholder('enter a password'),
    password_confirmation: Form.password().label('Confirm Password').placeholder('confirm your password'),
    country              : Form.reference(countries).label('Country').validators(isRequired).placeholder('ooga'),
    time                 : Form.time().label('Time').validators(isRequired),
    selectCountry        : Form.select(countries).label('Select Country').validators(isRequired).placeholder('ooga'),
    money                : Form.number().label('Show Me').validators(isRequired).placeholder('The Money'),
  });

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
      <form.field.country.Editor className='span2' />
      <form.field.selectCountry.Editor className='span2' />
      <form.field.time.Editor className='span2' />
    </div>
    <div className='content'>
      <form.field.password.Editor />
      <form.field.password_confirmation.Editor />
      <form.field.money.Editor />
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

function guid(): string {
  // http://www.ietf.org/rfc/rfc4122.txt
  let s: any[] = [];
  let hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-';

  let uuid = s.join('');
  return uuid;
}

class ComplexCellData {
  id: string;
  name: string;
  age: number;
  constructor(id: string, name: string, age: number) {
    this.id   = id;
    this.name = name;
    this.age  = age;
  }
  clone() {
    return new ComplexCellData(guid(), this.name, this.age);
  }
  static compare(val1: ComplexCellData, val2: ComplexCellData) {
    if (!val1 && !val2) return 0;
    if (!val1) return -1;
    if (!val2) return 1;

    let compareVal = val1.name.localeCompare(val2.name);
    if (compareVal === 0) {
      compareVal = val1.age > val2.age ? -1 : val1.age < val2.age ? 1 : 0;
    }
    return compareVal;
  }
}

const ComplexCell: React.SFC<ICell> = (cell) => {
  return (
    <div style={{width: '100%', textAlign: cell.align}}>
      <div style={{fontSize: '0.85rem', fontWeight: 'bold', color: '#14809D'}}>
        {cell.value && cell.value.name}
      </div>
      <div style={{fontSize: '0.8rem'}}>
        {cell.value && cell.value.age}
      </div>
    </div>
  );
};

function createTestGrid(nRows: number, nColumns: number) {
  console.time('start tester');
  // make sure we have enough columns passed.
  if (nColumns < 10) throw new Error('add some more columns!');

  // create some random sized columns!
  let cols = [];
  for (let col = 0; col < nColumns; col++) {
    cols.push(createColumn('column' + col, 'Header# ' + col, 'text', Math.trunc(Math.random() * 250 + 50) + 'px'));
  }
  cols.push(createColumn('phoneColumn', 'Phone', {type: 'phone'}, Math.trunc(Math.random() * 250 + 50) + 'px'));
  cols.push(createColumn('numberColumn', 'Number', {type: 'number', options: {decimals: 2, thousandSeparator: false}}, Math.trunc(Math.random() * 250 + 50) + 'px'));
  cols.push(createColumn('dateColumn', 'Date', 'date', Math.trunc(Math.random() * 250 + 50) + 'px'));
  cols.push(createColumn('timeColumn', 'Time', 'time', Math.trunc(Math.random() * 250 + 50) + 'px'));
  cols.push(createColumn('autoCompleteColumn', 'Auto Complete', {type: 'auto-complete', options: countries}, Math.trunc(Math.random() * 250 + 50) + 'px'));
  cols.push(createColumn('selectColumn', 'Select', {type: 'select', options: countries}, Math.trunc(Math.random() * 250 + 50) + 'px'));
  cols.push(createColumn('checkedColumn', 'Checked', 'checked', Math.trunc(Math.random() * 250 + 50) + 'px'));

  let complexColumn = createColumn('complexColumn', 'Complex', 'none', Math.trunc(Math.random() * 250 + 50) + 'px');
  complexColumn.renderer  = ComplexCell;
  complexColumn.compare   = ComplexCellData.compare;
  complexColumn.validator = (value: any): IError | undefined => {
    if (value === undefined) {
      return undefined;
    }

    let error: IError | undefined;
    let errorMsg: string             = '';
    let errorSeverity: ErrorSeverity = ErrorSeverity.error;
    if (value.name === 'Homer') {
      errorMsg      = 'No Homers allowed!';
      errorSeverity = ErrorSeverity.critical;
    }
    error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
    return error;
  };
  cols.push(complexColumn);
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
  // cols[6].setEditor({type: 'number', options: {decimals: 3, thousandSeparator: true}});

  // add some cell data!
  let rows = [];
  for (let row = 0; row < nRows; row++) {
    let r: any = {id: row, options: {allowMergeColumns: true}};
    for (let column = 0; column < cols.length; column++) {
      let v: any  = `RC ${column}-${row % 5}`;
      let colName = cols[column].name;
      if ((column <= 1 || column >= 4) && row === 1) v = undefined;
      else if ((colName === 'autoCompleteColumn') || (colName === 'selectColumn')) v = {id: '14', name: 'Austria'};
      else if (colName === 'checkedColumn') v = true;
      else if (colName === 'timeColumn') v = '7:30';
      else if (colName === 'dateColumn') v = '2018-11-11';
      else if (colName === 'complexColumn') v = row > 3 ? new ComplexCellData(guid(), 'Homer', 45) : undefined;
      else if (colName === 'phoneColumn') v = Number.parseInt('1250' + Math.round(Math.random() * 100000000).toString());
      else if (((column >= 5) && (column <= 6)) || colName === 'numberColumn') v = Math.random() * 10000;
      r[colName] = v;
    }
    rows.push(r);
  }
  // Some fixed columns to the left
  cols[0].fixed   = true;
  cols[0].width   = '128px';
  cols[0].align   = 'center';
  cols[1].fixed   = true;
  cols[1].width   = '65px';
  cols[1].align   = 'right';
  // create the grid model and group by 'column2' and 'column3'
  let grid = createGrid(rows, cols, ['column2', 'column3']);

  grid.fixedRows[0].cells['column5'].value = 'Sales';
  grid.fixedRows[0].cells['column6'].value = 'Sales';
  grid.addFixedRow({column5: '2017', column6: '2018'});
  grid.multiSelect = true;

  // sort first by  column7 then by column6
  grid.addSort(grid.columnByPos(7)!, 'ascending')
      .addSort(grid.columnByPos(6)!, 'descending');

  // test changing colum and cell properties
  setTimeout(() => {
    grid.columnByPos(4).canSort = false;
    grid.columnByPos(5).editable = true;
    grid.columnByPos(6).readOnly = true;
    grid.columnByPos(7).enabled = false;
    grid.columnByPos(8).enabled = false;
    grid.columnByPos(8).renderer = (cell) => <div>{cell.value + ' Col'}</div>;
    grid.cellByPos(0, 9).renderer = (cell) => <div>{cell.value + ' Cell'}</div>;
    grid.cellByPos(0, 7).align = 'right';
    grid.cellByPos(0, 7).enabled = true;
    grid.columnByPos(7).align = 'center';
    grid.columnByPos(6).setEditor({type: 'number', options: {decimals: 3, thousandSeparator: true}});
    grid.clearSelection();
  }, 2500);
  setTimeout(() => {
    grid.cellByPos(0, 7).align = '';
    grid.cellByPos(0, 7).enabled = false;
    grid.clearSelection();
  }, 5000);
  grid.cellByPos(0, 5).editable = false;
  grid.cellByPos(0, 6).readOnly = false;
  grid.cellByPos(0, 8).renderer = (cell) => <div>{cell.value + ' Cell'}</div>;

  console.timeEnd('start tester'); // how long did it take to create the reactive model?
  return grid;
}

let grid = createTestGrid(40, 14);
let newRow = {id: 'newRowxycdij', options: {allowMergeColumns: true}};
newRow['column0']    = 'AHHH';
newRow['column2']    = 'RC 2-3';
newRow['column3']    = 'RC 3-3';
newRow['timeColumn'] = '8:11';
grid.addRow(newRow);

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

// watch(() => grid.changed, () => {
//   if (grid.changed) {
//     console.log('IT HAS CHANGED');
//   } else {
//     console.log('IT IS THE SAME');
//   }
// });

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
  cols.push(createColumn('selectColumn', 'Select', {type: 'select', options: countries}));
  cols.push(createColumn('autoCompleteColumn', 'Auto Complete', {type: 'auto-complete', options: countries}));

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
  grid.addSort(grid.columnByPos(0)!, 'ascending');

  return grid;
}

let employeesGrid = createEmployeesGrid();

const _Home = (props: any) => <Observe render={() => (
    <div>
      <div>
        <Button color='primary' variant='contained' onClick={() => loginDialog.open()}>Load Dialog Test</Button>
        <DialogLoginForm />
        {/* <LoginFormView form={loginDialog.form} /> */}
        <DialogView dialog={confirmation}>
          <Typography style={{margin: 16}}>Are you sure you want to do this crazy shit?</Typography>
        </DialogView>
        <div style={{overflow: 'auto', padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{marginBottom: '10px'}}>
            <Button style={{marginRight: '15px'}} variant='contained' onClick={() => grid.addRow({id: 'newRow-' + Math.random() * 2000, 'column2': 'RC 2-1', 'column3': 'RC 3-1', options: {allowMergeColumns: true}})}>Add Row</Button>
            <Button style={{marginRight: '15px'}} variant='contained' onClick={() => grid.removeRow(grid.dataRowsByPosition[grid.dataRowsByPosition.length - 1].id)}>Remove Row</Button>
            <Button style={{marginRight: '15px'}} variant='contained' onClick={() => grid.dataRowsByPosition[0].cells['numberColumn'].value = 1337}>Change Number Cell Value</Button>
            <Button style={{marginRight: '15px'}} variant='contained' onClick={() => {
              if (grid.dataRowsByPosition[0].cells['complexColumn'].value) {
                Object.assign(grid.dataRowsByPosition[0].cells['complexColumn'].value, {name: 'Smithers', age: 57});
              } else {
                grid.dataRowsByPosition[0].cells['complexColumn'].value = new ComplexCellData(guid(), 'Smithers', 57);
              }
            }}>
              Change Complex Cell Value
            </Button>
            <Observe render={() => (<Button variant='contained' disabled={!grid.changed} onClick={() => grid.revert()}>Enabled if has Changes. Reverts Changes</Button>)} />
          </div>
          <Paper style={{width: '80%', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 800}}>
            <Observe render={() => (<Grid grid={grid} gridFontSizes={{header: '0.9rem', body: '0.9rem', groupRow: '0.8rem'}} />)} />
          </Paper>
          <Paper style={{width: '80%', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400}}>
            <Grid grid={employeesGrid} gridFontSizes={{header: '0.95rem', body: '0.9rem', groupRow: '0.8rem'}} />
          </Paper>
        </div>
      </div>
    </div>
)} />;


const Home = _Home;

class TestDialog extends Modal {
  form = Form.create({
    date                 : Form.date().label('Date').validators(isRequired),
    dollars              : Form.number().label('Dollars').validators(isRequired).placeholder('Show me the money').disableErrors().startAdornment(() => <div style={{display: 'flex', alignItems: 'center'}}><AddIcon /><span>$</span></div>),
    shouldI              : Form.select(searcher).label('Should I?').placeholder('choose!').startAdornment(() => <AccessibilityIcon />).validators(isRequired),
    isGreat              : Form.boolean().label('Is Great'),
    noLabel              : Form.boolean(),
    disabled             : Form.boolean().label('Disabled').disabled(() => true),
    email                : Form.email().label('Email').validators(isRequired).placeholder('enter a valid email'),
    password             : Form.password().label('Password').validators(and(isRequired, isSameAsOther('password_confirmation', 'passwords are not the same'))).placeholder('enter a password').updateOnChange(),
    password_confirmation: Form.password().label('Confirm Password').placeholder('confirm your password').updateOnChange(),
    phone                : Form.phone().label('Phone Number').validators(isRequired).placeholder('your phone number'),
    country              : Form.reference(countries).label('Country').placeholder('pick a country').startAdornment(() => <AccessibilityIcon />).validators(isRequired),
    time                 : Form.time().label('Time').placeholder('enter a time').validators(isRequired).validateOnUpdate(false),
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
  <Observe render={() => (
    <FormView form={form} onSubmit={testDialog.actionFn('login')}>
      <div className='content'>
        <form.field.date.Editor className='span4' />
        <form.field.dollars.Editor className='span4' />
        <form.field.shouldI.Editor className='span4' />
      </div>
      <div className='content'>
        <form.field.noLabel.Editor className='span4' />
        <form.field.disabled.Editor className='span4' />
        <form.field.email.Editor className='span4' />
      </div>
      <div className='content'>
        <form.field.password.Editor />
        <form.field.password_confirmation.Editor />
        <form.field.phone.Editor />
      </div>
      <div className='content'>
        <form.field.country.Editor className='span4' />
        <form.field.isGreat.Editor className='span4' />
        <form.field.time.Editor className='span4' />
      </div>
      <div className='content'>
      <form.field.avatar.Editor />
      </div>
      <div className='content'>
        <button style={{height: '30px'}}  value='Submit' onClick={testDialog.actionFn('login')}>Submit</button>
        <button style={{height: '30px'}}  value='Cancel' onClick={testDialog.actionFn('cancel')}>Cancel</button>
      </div>
    </FormView>
  )} />;
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
  let theme = createMuiTheme({typography: {useNextVariants: true}});
  ReactDOM.render(<MuiThemeProvider theme={theme}><BasicExample /></MuiThemeProvider>, document.getElementById('root'));
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