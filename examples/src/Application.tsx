import * as React                         from 'react';
import * as ReactDOM                      from 'react-dom';
import * as nanoid                        from 'nanoid';
import { countries, employees, searcher } from './demo-data';
import { SampleLoginDialog }              from './SampleLoginDialog';
import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink,
} from 'react-router-dom';
import {
  delay,
} from 'rewire-common';
import {
  Observe,
  observable
} from 'rewire-core';
import {
  Sortable,
  SortableList,
  IItem,
  Form,
  FormView,
  Modal,
  Dialog,
  isRequired,
  and,
  isSameAsOther,
  isDifferenceOfOthers,
  isSumOfOthers,
  isLessThan,
  requiredWhenOtherIsNotNull,
  requiredWhenOtherIsValue,
} from 'rewire-ui';
import {
  createGrid,
  createColumn,
  IError,
  ErrorSeverity,
  Grid,
  IRowData,
  ICell,
  IRow,
  isGreaterThan        as gridIsGreaterThan,
  isRequired           as gridIsRequired,
  isSumOfOthers        as gridIsSumOfOthers,
  isDifferenceOfOthers as gridIsDifferenceOfOthers,
} from 'rewire-grid';

import Paper                                from '@material-ui/core/Paper';
import ListItem                             from '@material-ui/core/ListItem';
import Button                               from '@material-ui/core/Button';
import Typography                           from '@material-ui/core/Typography';
import AddIcon                              from '@material-ui/icons/Add';
import AccessibilityIcon                    from '@material-ui/icons/Accessibility';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import './graphqltest';

interface IDocument {
  id: string;
  name?: string;
  code?: string;
}

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

const ooga: IOoga = observable({
  YesNoValue: 'Yes',
  name      : 'Sandy',
  money     : 45,
  open      : false,
  loading   : false
});

setTimeout(() => {
  ooga.YesNoValue = 'BLAH';
}, 4000);

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

const loginDialog = new SampleLoginDialog();
const LoginFormView = ({form}: {form: typeof loginDialog.form}) => (
  <div style={{fontSize: '16px'}}>
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
      <form.field.date.Editor />
      <form.field.multi.Editor />
      <form.field.color.Editor />
    </div>
  </FormView>
  </div>
);

// override title from
const getLoginTitle = (dialog: Modal): JSX.Element => <div>Login</div>;

const DialogLoginForm = () => (
  <Dialog dialog={loginDialog} title={getLoginTitle} maxWidth='lg'>
    <LoginFormView form={loginDialog.form} />
  </Dialog>
);

class GridHotkeysDialogModel extends Modal {
  constructor() {
    super('');
    this.action('close', {color: 'secondary', icon: 'cancel'});
  }

  submit = async () => {
    console.log('awaiting submit');
    await this.submit();
    console.log('2 sec delay');
    await delay(2000);
    console.log('after 2 sec delay');
    setTimeout(() => confirmation.open(), 0);
    // await perform login from server
    return true;
  }
}

const gridHotkeysDialogModel = new GridHotkeysDialogModel();

const getGridDialogTitle = (dialog: Modal): JSX.Element => {
  return <div>Grid Hotkeys List</div>;
};

const GridHotkeysDialog = () => (
  <Dialog dialog={gridHotkeysDialogModel} title={getGridDialogTitle} maxWidth='md'>
    <div style={{padding: '16px', maxHeight: '500px'}}>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap: 'wrap'}}>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + C:</Typography>
          <Typography>Copy Selected Cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + V:</Typography>
          <Typography>Paste To Selected Cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + X:</Typography>
          <Typography>Cut Selected Cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + R:</Typography>
          <Typography>Revert Selected Cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + U:</Typography>
          <Typography>Revert Selected Row(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + Insert:</Typography>
          <Typography>Insert Row below selected row(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + D:</Typography>
          <Typography>Duplicate selected row(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + Delete:</Typography>
          <Typography>Delete selected row(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Escape:</Typography>
          <Typography>If editing, exit editing without changes. Otherwise, de-select cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Enter:</Typography>
          <Typography>If editing, exit editing with changes</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Delete:</Typography>
          <Typography>If not editing, delete value of selected cell(s)</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Arrow Up:</Typography>
          <Typography>Move up one cell</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Arrow Down:</Typography>
          <Typography>Move down one cell</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Arrow Left:</Typography>
          <Typography>Move left one cell. If end of line, attempt to wrap to line above</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Arrow Right:</Typography>
          <Typography>Move right one cell. If end of line, attempt to wrap to line below</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Home:</Typography>
          <Typography>Go to the first selectable cell of the row</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>End:</Typography>
          <Typography>Go to the last selectable cell of the row</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + Home:</Typography>
          <Typography>Go to the first selectable cell of the grid</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + End:</Typography>
          <Typography>Go to the last selectable cell of the grid</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + Click:</Typography>
          <Typography>If Multiselect, append selection</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Ctrl + Drag:</Typography>
          <Typography>If Multiselect, append dragged cells</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Shift + Click:</Typography>
          <Typography>If Multiselect, append cells between start and clicked cell</Typography>
        </div>
        <div style={{display: 'flex'}}>
          <Typography style={{width: '125px'}}>Shift + Drag:</Typography>
          <Typography>If Multiselect, append cells between start and dragged cells</Typography>
        </div>
      </div>
    </div>
  </ Dialog>
);

const confirmation = new Modal('Delete entire hard drive?')
  .action('yes', () => (console.log('no way you chose that'), true), {color: 'primary'})
  .action('no');

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
    return new ComplexCellData(this.id, this.name, this.age);
  }
  toString() {
    return `${this.name} ${this.age}`;
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
      <div style={{fontSize: '0.9em', fontWeight: 'bold', color: '#14809D'}}>
        {cell.value && cell.value.name}
      </div>
      <div style={{fontSize: '0.85em'}}>
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
    cols.push(createColumn('column' + col, 'Header# ' + col, {type: 'text', width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  }
  cols[5].title = 'Sales';
  cols[6].title = 'Sales';

  let timeOutOnValueChange = (cell: ICell, value: any) => cell.row.cells['differenceColumn'].setValue((cell.row.cells['timeInColumn'].value || 0) - (value || 0));
  let timeInOnValueChange  = (cell: ICell, value: any) => cell.row.cells['differenceColumn'].setValue((value || 0) - (cell.row.cells['timeOutColumn'].value || 0));

  cols.push(createColumn('phoneColumn',        'Phone',           {type: {type: 'phone'}, width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  cols.push(createColumn('numberColumn',       'Number',          {type: {type: 'number', options: {decimals: 2, fixed: true, thousandSeparator: false}}, validator: gridIsRequired, width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  cols.push(createColumn('dateColumn',         'Date',            {type: 'date', width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  cols.push(createColumn('timeOutColumn',      'Time Out',        {type: {type: 'time'}, onValueChange: timeOutOnValueChange, width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  cols.push(createColumn('timeInColumn',       'Time In',         {type: {type: 'time'}, validator: gridIsGreaterThan('timeOutColumn'), onValueChange: timeInOnValueChange, width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  cols.push(createColumn('differenceColumn',   'Time Difference', {type: {type: 'number', options: {decimals: 2}}, validator: gridIsDifferenceOfOthers(['timeInColumn', 'timeOutColumn']), width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  cols.push(createColumn('sumColumn',          'Time Sum',        {type: {type: 'number', options: {decimals: 2}}, validator: gridIsSumOfOthers(['timeInColumn', 'timeOutColumn']), width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  cols.push(createColumn('autoCompleteColumn', 'Auto Complete',   {type: {type: 'auto-complete', options: countries}, width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  cols.push(createColumn('selectColumn',       'Select',          {type: {type: 'select', options: countries}, width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  cols.push(createColumn('multiselectColumn',  'MultiSelect',     {type: {type: 'multiselect', options: countries}, width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  cols.push(createColumn('checkedColumn',      'Checked',         {type: 'checked', width: Math.trunc(Math.random() * 250 + 50) + 'px'}));

  let complexColumnValidator = {
    linkedColumnNames: [],
    fn: (row: IRow, value: any): IError | undefined => {
      if (value === undefined) {
        return undefined;
      }

      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      if (value.name === 'Homer') {
        errorMsg      = 'No Homers allowed!';
        errorSeverity = ErrorSeverity.Critical;
      }
      error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
      return error;
    }
  };

  cols.push(createColumn('complexColumn', 'Complex', {type: 'none', renderer: ComplexCell, compare: ComplexCellData.compare, validator: complexColumnValidator, width: Math.trunc(Math.random() * 250 + 50) + 'px'}));
  // Override and set some columns to be number!
  cols[5].setEditor({type: 'number', options: {decimals: 2, thousandSeparator: true}});
  cols[5].validator = {
    linkedColumnNames: [],
    fn: (row: IRow, value: any): IError | undefined => {
      if (value === undefined) {
        return undefined;
      }

      let error: IError | undefined;
      let errorMsg: string             = '';
      let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
      if (value < 2000) {
        errorMsg      = 'Less than 2000';
        errorSeverity = ErrorSeverity.Warning;
      } else if (value > 7000) {
        errorMsg      = 'Greater than 7000';
        errorSeverity = ErrorSeverity.Critical;
      } else if (value > 4000) {
        errorMsg      = 'Greater than 4000';
        errorSeverity = ErrorSeverity.Error;
      } else if (value >= 2000 && value <= 4000) {
        errorMsg      = 'Between 2000 and 4000';
        errorSeverity = ErrorSeverity.Info;
      }
      error = errorMsg ? {messageText: errorMsg, severity: errorSeverity} : undefined;
      return error;
    }
  };
  cols[6].setEditor({type: 'number', options: {decimals: 3, thousandSeparator: true}});

  // add some cell data!
  let rows: IRowData[] = [];
  for (let row = 0; row < nRows; row++) {
    let r: IRowData = {id: `${row}`, data: {}};
    for (let column = 0; column < cols.length; column++) {
      let v: any  = `RC ${column}-${row % 5}`;
      let colName = cols[column].name;
      if ((column <= 1 || column >= 4) && row === 1) v = undefined;
      else if ((colName === 'autoCompleteColumn') || (colName === 'selectColumn')) v = {id: '14', name: 'Austria'};
      else if (colName === 'multiselectColumn') v = [{id: '14', name: 'Austria'}];
      else if (colName === 'checkedColumn') v = true;
      else if (colName === 'timeOutColumn') v = 7.5;
      else if (colName === 'timeInColumn') v = 11.5;
      else if (colName === 'differenceColumn') v = 4;
      else if (colName === 'sumColumn') v = 19;
      else if (colName === 'dateColumn') v = '2018-11-11';
      else if (colName === 'complexColumn') v = row > 3 ? new ComplexCellData(nanoid(10), 'Homer', 45) : undefined;
      else if (colName === 'phoneColumn') v = Number.parseInt('1250' + Math.round(Math.random() * 100000000).toString());
      else if (((column >= 5) && (column <= 6)) || colName === 'numberColumn') v = Math.random() * 10000;
      r.data![colName] = v;
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
  let grid = createGrid(rows, cols, {groupBy: ['column2', 'column3'], multiSelect: true, allowMergeColumns: true});

  grid.addFixedRow({data: {column5: '2017', column6: '2018'}});

  // sort first by  column7 then by column6
  grid.addSort(grid.columnByPos(7)!, 'ascending')
      .addSort(grid.columnByPos(6)!, 'descending');

  // test changing colum and cell properties
  // setTimeout(() => {
  //   grid.columnByPos(4).canSort = false;
  //   grid.columnByPos(5).editable = true;
  //   grid.columnByPos(6).readOnly = true;
  //   grid.columnByPos(7).enabled = false;
  //   grid.columnByPos(8).enabled = false;
  //   grid.columnByPos(8).renderer = (cell) => <div>{cell.value + ' Col'}</div>;
  //   grid.cellByPos(0, 9).renderer = (cell) => <div>{cell.value + ' Cell'}</div>;
  //   grid.cellByPos(0, 7).align = 'right';
  //   grid.cellByPos(0, 7).enabled = true;
  //   grid.columnByPos(7).align = 'center';
  //   grid.columnByPos(6).setEditor({type: 'number', options: {decimals: 3, thousandSeparator: true}});
  //   grid.clearSelection();
  // }, 2500);
  // setTimeout(() => {
  //   grid.cellByPos(0, 7).align = '';
  //   grid.cellByPos(0, 7).enabled = false;
  //   grid.cellByPos(0, 19).setValue(3);
  //   grid.cellByPos(0, 20).setValue(20);
  //   grid.clearSelection();
  // }, 5000);
  // grid.cellByPos(0, 5).editable = false;
  // grid.cellByPos(0, 6).readOnly = false;
  // grid.cellByPos(0, 8).renderer = (cell) => <div>{cell.value + ' Cell'}</div>;

  console.timeEnd('start tester'); // how long did it take to create the reactive model?
  return grid;
}

let grid                  = createTestGrid(40, 14);
let newRow                = {id: 'newRowxycdij', data: {}, options: {allowMergeColumns: false}};
newRow.data['column0']    = 'AHHH';
newRow.data['column2']    = 'RC 2-3';
newRow.data['column3']    = 'RC 3-3';
newRow.data['timeColumn'] = '8:11';
grid.addRow(newRow);

grid.cell('3', 'column8')!.value = 'ooga booga boa';
const r                          = grid.get();
console.log(r);
// setTimeout(() => grid.rows.length = 0, 4000);
// setTimeout(() => grid.set(r), 3000);
// setTimeout(() => expandAll(grid), 6000);
// setTimeout(() => grid.rows[0].cells['column0'].value = 'booga', 6000);
// setTimeout(() => grid.columns[3].visible = false, 7000);
// setTimeout(() => grid.columns[3].visible = true, 8000);

function createEmployeesGrid1() {
  let cols = [];

  // add header columns
  cols.push(createColumn('name',                'Employee',       {type: 'text', width: '120px'}));
  cols.push(createColumn('email',               'Email',          {type: 'text', width: '120px'}));
  cols.push(createColumn('isActive',            'IsActive',       {type: 'checked', width: '150px'}));
  cols.push(createColumn('timeColumn',          'Time',           {type: {type: 'time'}, width: '150px'}));
  cols.push(createColumn('selectColumn',        'Select',         {type: {type: 'select', options: countries}, width: '150px'}));
  cols.push(createColumn('multiselectColumn',   'Multiselect',    {type: {type: 'multiselect', options: countries}, width: '150px'}));
  cols.push(createColumn('autoCompleteColumn',  'Auto Complete',  {type: {type: 'auto-complete', options: countries}, width: '150px'}));

  // add employee rows
  let rows: IRowData[] = [];
  for (let row = 0; row < employees.length; row++) {
    let r: IRowData = {id: `${row}`, data: {}};
    for (let column = 0; column < cols.length; column++) {
      let fieldName: string = cols[column].name;
      let v: any;
      if (fieldName === 'name') {
        v = employees[row][fieldName]; // somehow make into a button that opens a dialog on click???
      } else if (fieldName === 'multiselectColumn') {
        v = [{id: '14', name: 'Austria'}];
      } else {
        v = employees[row][fieldName];
      }
      r.data![fieldName] = v;
    }
    rows.push(r);
  }

  // create the grid model
  let grid = createGrid(rows, cols, {multiSelect: true, allowMergeColumns: true});
  // sort by employee names
  grid.addSort(grid.columnByPos(0)!, 'ascending');

  return grid;
}

function createEmployeesGrid2() {
  let cols = [];

  // add header columns
  cols.push(createColumn('name',               'Employee',        {type: 'text',    width: '120px'}));
  cols.push(createColumn('email',              'Email',           {type: 'text'   , width: '120px'}));
  cols.push(createColumn('isActive',           'IsActive',        {type: 'checked', width: '250px'}));
  cols.push(createColumn('timeColumn',         'Time',            {type: {type: 'time'}, width: '250px'}));
  cols.push(createColumn('selectColumn',       'Select',          {type: {type: 'select', options: countries}, width: '250px'}));
  cols.push(createColumn('multiselectColumn',  'Multiselect',     {type: {type: 'multiselect', options: countries}, width: '100px'}));
  cols.push(createColumn('autoCompleteColumn', 'Auto Complete',   {type: {type: 'auto-complete', options: countries}, width: '100px'}));
  cols.push(createColumn('numberColumn1',      'Number Column 1', {type: {type: 'number', options: {}}, width: '250px'}));
  cols.push(createColumn('numberColumn2',      'Number Column 2', {type: {type: 'number', options: {}}, width: '250px'}));
  cols.push(createColumn('numberColumn3',      'Number Column 3', {type: {type: 'number', options: {}}, width: '250px'}));

  // add employee rows
  let rows: IRowData[] = [];
  for (let row = 0; row < employees.length; row++) {
    let r: IRowData = {id: `${row}`, data: {}};
    for (let column = 0; column < cols.length; column++) {
      let fieldName: string = cols[column].name;
      let v: any;
      if (fieldName === 'name') {
        v = employees[row][fieldName]; // somehow make into a button that opens a dialog on click???
      } else if (fieldName === 'multiselectColumn') {
        v = [{id: '14', name: 'Austria'}];
      } else {
        v = employees[row][fieldName];
      }
      r.data![fieldName] = v;
    }
    rows.push(r);
  }

  // create the grid model
  let grid = createGrid(rows, cols, {multiSelect: true});
  // sort by employee names
  grid.addSort(grid.columnByPos(0)!, 'ascending');

  return grid;
}

let employeesGrid1 = createEmployeesGrid1();
let employeesGrid2 = createEmployeesGrid2();

// observable dates don't work, but not sure if they ever need to.
// let testDate = observable(new Date());
let mode = observable({
  gridMode: 'employees1',
});

const Home = (props: any) => <Observe render={() => (
    <div>
      <div>
        {/* <span>{testDate.toDateString()}</span> */}
        <Button color='primary' variant='contained' style={{marginRight: '15px'}} onClick={() => {loginDialog.open(); }}>Load Dialog Test</Button>
        <Button color='primary' variant='contained' onClick={() => gridHotkeysDialogModel.open()}>Load Grid Hotkeys List</Button>
        <DialogLoginForm />
        <GridHotkeysDialog />
        {/* <LoginFormView form={loginDialog.form} /> */}
        <Dialog dialog={confirmation}>
          <Typography style={{margin: 16}}>Are you sure you want to do this crazy shit?</Typography>
        </Dialog>
        <div style={{overflow: 'auto', padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Button style={{margin: '0px 15px 10px 0px'}} variant='contained' onClick={() => grid.selectCellByPos(0, 4)}>Select Cell</Button>
            <Button style={{margin: '0px 15px 10px 0px'}} variant='contained' onClick={() => grid.selectCellsByRange(1, 4, 3, 5)}>Select Cells</Button>
            <Button style={{margin: '0px 15px 10px 0px'}} variant='contained' onClick={() => {
              grid.addRow({id: 'newRow-' + Math.random() * 2000, data: {column2: 'RC 2-1', column3: 'RC 3-1'}});
              employeesGrid1.addRow({id: 'newRow-' + Math.random() * 2000, data: {name: 'New Employee', email: 'employeeEmail@test.com'}});
            }}>
              Add Row
            </Button>
            <Button style={{margin: '0px 15px 10px 0px'}} variant='contained' onClick={() => grid.removeRow(grid.dataRowsByPosition[grid.dataRowsByPosition.length - 1].id)}>Remove Row</Button>
            <Button style={{margin: '0px 15px 10px 0px'}} variant='contained' onClick={() => grid.dataRowsByPosition.forEach(row => row.cells['numberColumn'].setValue(1337))}>Change Number Cell Value</Button>
            <Button style={{margin: '0px 15px 10px 0px'}} variant='contained' onClick={() => grid.dataRowsByPosition.forEach(row => row.setValue({'numberColumn': 2222, 'dateColumn': '1985-11-26'}))}>Change Number And Date Cells</Button>
            <Button style={{margin: '0px 15px 10px 0px'}} variant='contained' onClick={() => grid.dataRowsByPosition.forEach(row => row.clear(['numberColumn', 'dateColumn']))}>Clear Number And Date</Button>
            <Button style={{margin: '0px 15px 10px 0px'}} variant='contained' onClick={() => grid.dataRowsByPosition.forEach(row => row.cells['complexColumn'].setValue(new ComplexCellData('smithers027', 'Smithers', 57)))}>
              Change Complex Cell Value
            </Button>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Observe render={() => (<Button style={{margin: '0px 15px 10px 0px'}} variant='contained' disabled={!grid.changed} onClick={() => grid.revert()}>Enabled if has Changes. Reverts Changes</Button>)} />
            <Observe render={() => (<Button style={{margin: '0px 15px 10px 0px'}} variant='contained' disabled={!grid.inError}>Enabled if has Errors</Button>)} />
            <Observe render={() => (<Button style={{margin: '0px 15px 10px 0px'}} variant='contained' onClick={() => console.log(grid.get())}> Save All</Button>)} />
            <Observe render={() => (<Button style={{margin: '0px 0px 10px 0px'}} variant='contained' onClick={() => console.log(grid.getChanges())}> Save Changes</Button>)} />
          </div>
          <Paper style={{padding: 20, width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'}}>
            <Observe render={() => (<Grid grid={grid} gridFontSizes={{header: '0.9rem', body: '0.85rem', groupRow: '0.8rem'}} style={{height: '650px'}} />)} />
          </Paper>
          <Paper style={{padding: 20, width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{display: 'flex', marginBottom: '10px'}}>
              <Button onClick={() => mode.gridMode = 'employees1'} variant='outlined'>Grid 1</Button>
              <Button onClick={() => mode.gridMode = 'employees2'} variant='outlined'>Grid 2</Button>
            </div>
            <Grid key={mode.gridMode} grid={mode.gridMode === 'employees1' ? employeesGrid1 : employeesGrid2} gridFontSizes={{header: '0.95rem', body: '0.9rem', groupRow: '0.8rem'}} style={{height: '400px'}} />
          </Paper>
        </div>
      </div>
    </div>
)} />;

class TestDialog extends Modal {
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
    switch2              : Form.switch(),
    color                : Form.color().disabled(() => true),
  }, {email: 'splace@worksight.net', isGreat: true, switch2: true, phone: '34232221535'}, {variant: 'outlined', initialValuesValidationMode: 'withValues'});

  constructor() {
    super('Test Form');
    this.action('login', this.submit, {type: 'submit', disabled: () => !this.form.hasChanges})
        .action('cancel', {color: 'secondary', icon: 'cancel'});
  }

  submit = async () => {
    await this.submit();
    console.log(this.form.value);
    await delay(2000);
    setTimeout(() => confirmation.open(), 0);
    // await perform login from server
    return true;
  }
}

const About = (props: any) => (
  <div>
    <h2>About</h2>
    <TestFormView form={testDialog.form} />
  </div>
);

let sortableItems: IItem[] = observable([
  { id: '1item', name: 'First Item' },
  { id: '2item', name: 'Second Item' },
  { id: '3item', name: 'Third Item' },
  { id: '4item', name: 'Fourth Item' },
]);

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

const testDialog = new TestDialog();
const TestFormView = ({form}: {form: typeof testDialog.form}) => (
  <Observe render={() => (
    <div style={{fontSize: '16px'}}>
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
        <form.field.name.Editor className='span4' />
      </div>
      <div className='content'>
        <form.field.password.Editor />
        <form.field.password_confirmation.Editor />
        <form.field.phone.Editor />
        <form.field.phoneCustom.Editor />
      </div>
      <div className='content'>
        <form.field.timeOut.Editor className='span4' />
        <form.field.timeIn.Editor className='span4' />
        <form.field.isGreat.Editor className='span4' />
      </div>
      <div className='content'>
        <form.field.difference.Editor className='span1' />
        <form.field.sum.Editor className='span1' />
        <form.field.multi.Editor className='span1' />
      </div>
      <div className='content'>
        <form.field.switch1.Editor className='span1' />
        <form.field.switch2.Editor className='span1' />
        <form.field.color.Editor className='span1' />
        <form.field.country.Editor className='span4' />
      </div>
      <div className='content'>
      <form.field.avatar.Editor />
      </div>
      <div className='content'>
        <button style={{height: '30px'}} value='Submit' onClick={testDialog.actionFn('login')}>Submit</button>
        <button style={{height: '30px'}} value='Cancel' onClick={testDialog.actionFn('cancel')}>Cancel</button>
      </div>
    </FormView>
    </div>
  )} />
);

const sortableItemRenderer = (item: IItem): JSX.Element => {
  return (
    <ListItem key={item.id} component={NavLink} to={`/topics/props-v-state`} activeClassName={'activeLink'}>
      <Typography>{item.id}</Typography>
    </ListItem>
  );
};

const Topic = ({ match }: any) => (
  <div>
    <h3>{match.params.topicId}</h3>
  </div>
);

async function login() {
  // await fetch.post('accounts/login', { username: 'Administrator', password: '324#$as(lkf)' });
  let theme = createMuiTheme({typography: {useNextVariants: true}});
  ReactDOM.render(<MuiThemeProvider theme={theme}><BasicExample /></MuiThemeProvider>, document.getElementById('root'));
}

login();

export default BasicExample;