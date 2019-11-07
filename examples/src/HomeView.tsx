import * as React                                from 'react';
import * as nanoid                               from 'nanoid';
import { countries, employees }                  from './demo-data';
import { sampleModel, SampleDialog }             from './SampleDialog';
import { hotkeysModel, HotKeysDialog }           from './HotKeys';
import { YesNoModel, YesNoDialog }               from './YesNoDialog';
import { ConfirmationModel, ConfirmationDialog } from './YesNoDialog';
import { utc, UTC, isNullOrUndefined }           from 'rewire-common';
import { Observe, observable, watch, root }      from 'rewire-core';
import {
  ActionFn,
  WithStyle,
  withStyles,
  ActionMenu,
  IActionMenuItem,
  ToggleMenu,
  IToggleMenuItem,
  ISuggestionsContainerComponentProps,
  validator,
  field,
  ErrorSeverity,
  IError,
  error,
} from 'rewire-ui';
import {
  createGrid,
  createColumn,
  Grid,
  IRowData,
  ICell,
  IRow,
  IColumn,
  createColumnsToggleMenuItems,
}                            from 'rewire-grid';
import {PopoverOrigin}       from '@material-ui/core/Popover';
import Paper                 from '@material-ui/core/Paper';
import Button, {ButtonProps} from '@material-ui/core/Button';
import Typography            from '@material-ui/core/Typography';
import DeleteIcon            from '@material-ui/icons/DeleteOutlined';
import ArchiveIcon           from '@material-ui/icons/ArchiveOutlined';
import UnarchiveIcon         from '@material-ui/icons/UnarchiveOutlined';
import { uploadFile }        from './graphqltest';

interface IDocument {
  id:    string;
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

class ComplexCellData {
  id:   string;
  name: string;
  age:  number;

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

const ComplexCell: React.SFC<{cell: ICell}> = (props) => {
  const {cell} = props;
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

function formatTime(v?: any): string {
  return (v instanceof UTC) ? v.toTimeString() : v;
}

function handleRowClick(row: IRow) {
  console.log('row clicked', row);
}

function createTestGrid(nRows: number, nColumns: number) {
  console.time('start tester');
  // make sure we have enough columns passed.
  if (nColumns < 10) throw new Error('add some more columns!');

  // create some random sized columns!
  let cols: IColumn[] = observable([]);
  for (let col = 0; col < nColumns; col++) {
    cols.push(createColumn('column' + col, 'Header# ' + col, { type: 'text', width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  }
  cols[5].title = 'Sales';
  cols[6].title = 'Sales';

  let timeOnValueChange = (cell: ICell, value: any) => {
    if (!value) {
      cell.value = undefined;
      cell.row.cells.differenceColumn.value = undefined;
      return;
    }
    // if (!(value instanceof UTC)) {
    // cell.value = utc().startOfDay().add(value, TimeSpan.hours);
    //   return;
    // }
    // const diff = cell.row.cells.timeInColumn.value.subtract(cell.row.cells.timeOutColumn.value, TimeSpan.hours, 2);
    const diff = cell.row.cells.timeInColumn.value - cell.row.cells.timeOutColumn.value;
    cell.row.cells.differenceColumn.value = diff;
  };

  const customNumberValidator = function(value: any): IError | undefined {
    if (isNullOrUndefined(value)) {
      return undefined;
    }

    let error: IError | undefined;
    let errorMsg: string = '';
    let errorSeverity: ErrorSeverity = ErrorSeverity.Error;
    if (value < 2000) {
      errorMsg = 'Less than 2000';
      errorSeverity = ErrorSeverity.Warning;
    } else if (value > 7000) {
      errorMsg = 'Greater than 7000';
      errorSeverity = ErrorSeverity.Critical;
    } else if (value > 4000) {
      errorMsg = 'Greater than 4000';
      errorSeverity = ErrorSeverity.Error;
    } else if (value >= 2000 && value <= 4000) {
      errorMsg = 'Between 2000 and 4000';
      errorSeverity = ErrorSeverity.Info;
    }
    error = errorMsg ? { text: errorMsg, severity: errorSeverity } : undefined;
    return error;
  };

  cols.push(createColumn(['nestedColumn', 'value'], 'Nested Column',       { type: 'text', width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('maskColumn',              'Mask',                { type: { type: 'mask', options: { mask: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/] } }, width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('phoneColumn',             'Phone',               { type: { type: 'phone' }, width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('numberColumn',            'Number',              { type: { type: 'number', options: { decimals: 2, fixed: true, thousandSeparator: false } }, validators: ['required', customNumberValidator], width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('dateColumn',              'Date',                { type: 'date', width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('timeOutColumn',           'Time Out',            { type: { type: 'time', options: { disableErrors: false, map: formatTime } }, readOnly: true, onValueChange: timeOnValueChange, width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('timeInColumn',            'Time In',             { type: { type: 'time', options: { disableErrors: false, map: formatTime } }, validators: validator('>', field('timeOutColumn')), onValueChange: timeOnValueChange, width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('differenceColumn',        'Time Difference',     { type: { type: 'number', options: { decimals: 2 } }, validators: validator('differenceOf', field('timeInColumn'), field('timeOutColumn')), width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('sumColumn',               'Time Sum',            { type: { type: 'number', options: { decimals: 2 } }, validators: validator('sumOf', field('timeOutColumn'), field('timeInColumn')), width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('autoCompleteColumn',      'Auto Complete',       { type: { type: 'auto-complete', options: countries }, width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('multiAutoCompleteColumn', 'Multi Auto Complete', { type: { type: 'multiselectautocomplete', options: countries}, width: '250px'}));
  cols.push(createColumn('selectColumn',            'Select',              { type: { type: 'select', options: countries }, width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('multiselectColumn',       'MultiSelect',         { type: { type: 'multiselect', options: countries }, width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('checkedColumn',           'Checked',             { type: 'checked', width: Math.trunc(Math.random() * 250 + 50) + 'px' }));

  let complexColumnValidator = (value: any): IError | undefined => {
    if (isNullOrUndefined(value)) {
      return undefined;
    }
    return (value.name === 'Homer') ? error('no homers allowed', ErrorSeverity.Critical) : undefined;
  };

  cols.push(createColumn('complexColumn', 'Complex', { type: 'none', renderer: ComplexCell, compare: ComplexCellData.compare, validators: complexColumnValidator, width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  cols.push(createColumn('complexColumn2', 'Complex2', { type: 'none', renderer: ComplexCell, compare: ComplexCellData.compare, validators: complexColumnValidator, width: Math.trunc(Math.random() * 250 + 50) + 'px' }));
  // Override and set some columns to be number!
  cols[5].setEditor({ type: 'number', options: { decimals: 2, thousandSeparator: true } });
  cols[6].setEditor({ type: 'number', options: { decimals: 3, thousandSeparator: true } });

  // const timeIn:  UTC = utc().startOfDay().add(7.5, TimeSpan.hours);
  // const timeOut: UTC = utc().startOfDay().add(11,  TimeSpan.hours);

  // add some cell data!
  let rows: IRowData[] = [];
  for (let row = 0; row < nRows; row++) {
    let r: IRowData = { id: `${row}`, data: {}, options: {onClick: handleRowClick}};
    for (let column = 0; column < cols.length; column++) {
      let v: any = `RC ${column}-${row % 5}`;
      let colName = cols[column].name;
      if ((column <= 1 || column >= 4) && row === 1) v = undefined;
      else if (colName === 'autoCompleteColumn' || colName === 'selectColumn') v = { id: '14', name: 'Austria' };
      else if (colName === 'multiAutoCompleteColumn' || colName === 'multiselectColumn') v = [{id: '18', name: 'Bangladesh'}, {id: '19', name: 'Barbados'}];
      else if (colName === 'checkedColumn') v = true;
      // else if (colName === 'timeOutColumn') v = timeIn;
      // else if (colName === 'timeInColumn') v = timeOut;
      else if (colName === 'timeOutColumn') v = 7.5;
      else if (colName === 'timeInColumn') v = 11;
      else if (colName === 'differenceColumn') v = 4;
      else if (colName === 'sumColumn') v = 19;
      else if (colName === 'nestedColumn.value') { r.data!['nestedColumn'] = {value: 'ooga ' + row}; continue; }
      else if (colName === 'maskColumn') v = undefined;
      else if (colName === 'dateColumn') v = utc();
      else if (colName === 'complexColumn') v = row > 3 ? new ComplexCellData(nanoid(10), 'Homer', 45) : undefined;
      else if (colName === 'complexColumn2') v = row > 3 ? new ComplexCellData(nanoid(10), 'Smithers', 56) : undefined;
      else if (colName === 'phoneColumn') v = Number.parseInt('1250' + Math.round(Math.random() * 100000000).toString());
      else if (((column >= 5) && (column <= 6)) || colName === 'numberColumn') v = Math.random() * 10000;
      r.data![colName] = v;
    }
    rows.push(r);
  }
  // Some fixed columns to the left
  cols[0].fixed = true;
  cols[0].width = '128px';
  cols[0].align = 'center';
  cols[1].fixed = true;
  cols[1].width = '65px';
  cols[1].align = 'right';
  // create the grid model and group by 'column2' and 'column3'
  let grid = createGrid(rows, cols, { groupBy: ['column2', 'column3'], optionsMenuFn: () => ({ items: createColumnsToggleMenuItems(cols, ['column8', 'column9']) }), multiSelect: true, allowMergeColumns: true });

  grid.addFixedRow({ data: { column5: '2017', column6: '2018' } });
  // setTimeout(() => { grid.groupBy = [cols[5]]; }, 4000);
  // setTimeout(() => { grid.groupBy = [cols[6]]; }, 7000);
  // sort first by  column7 then by column6
  // grid.addSort(cols[7], 'ascending')
  //     .addSort(cols[6], 'descending');

  // test changing colum and cell properties
  // setTimeout(() => {
  //   grid.columnByPos(4).canSort = false;
  //   grid.columnByPos(5).editable = true;
    // grid.columnByPos(6).readOnly = true;
  //   grid.columnByPos(7).enabled = false;
  //   grid.columnByPos(8).enabled = false;
  //   grid.columnByPos(8).renderer = (props) => <div>{props.cell.value + ' Col'}</div>;
  //   grid.cellByPos(0, 9).renderer = (props) => <div>{props.cell.value + ' Cell'}</div>;
  //   grid.cellByPos(0, 7).align = 'right';
  //   grid.cellByPos(0, 7).enabled = true;
  //   grid.columnByPos(7).align = 'center';
  //   grid.columnByPos(6).setEditor({type: 'number', options: {decimals: 3, thousandSeparator: true}});
  //   grid.clearSelection();
  // }, 2500);
  // setTimeout(() => {
  //   grid.cellByPos(0, 7).align = '';
  //   grid.cellByPos(0, 7).enabled = false;
    // grid.cellByPos(0, 19).setValue(3);
  //   grid.cellByPos(0, 20).setValue(20);
  //   grid.clearSelection();
  // }, 5000);
  // grid.cellByPos(0, 5).editable = false;
  // grid.cellByPos(0, 6).readOnly = false;
  // grid.cellByPos(0, 8).renderer = (props) => <div>{props.cell.value + ' Cell'}</div>;

  console.timeEnd('start tester'); // how long did it take to create the reactive model?
  return grid;
}

let grid                     = createTestGrid(40, 14);
// let newRow                = {id: 'newRowxycdij', data: {}, options: {allowMergeColumns: false}};
// newRow.data['column0']    = 'AHHH';
// newRow.data['column2']    = 'RC 2-3';
// newRow.data['column3']    = 'RC 3-3';
// newRow.data['timeColumn'] = '8:11';
// grid.addRow(newRow);
// grid.cellByPos(0, 0)!.value = 'ooga booga boa';
// grid.dataRowsByPosition.forEach(row => row.cellsByColumnPosition.forEach(cell => cell.row = row));
// grid.headerRowHeight      = 28;
// grid.commit();
// const r                          = grid.get();
// console.log(r);
// setTimeout(() => grid.rows.length = 0, 4000);
// setTimeout(() => grid.set(r), 3000);
// setTimeout(() => expandAll(grid), 6000);
// setTimeout(() => grid.rows[0].cells['column0'].value = 'booga', 6000);
// setTimeout(() => grid.columns[3].visible = false, 7000);
// setTimeout(() => grid.columns[3].visible = true, 8000);

function toggleMenuHandleItemClick(item: IToggleMenuItem, column: IColumn) {
  column.visible = !column.visible;

  if (column.name === 'email') {
    let isActiveColumn      = column.grid.column('isActive');
    isActiveColumn!.visible = !isActiveColumn!.visible;
  } else if (column.name === 'isActive') {
    let emailColumn      = column.grid.column('email');
    emailColumn!.visible = !emailColumn!.visible;
  }
}

const clickHandler = (props: ISuggestionsContainerComponentProps) => () => {
  console.log('Add Item!');
  props.downShift.closeMenu();
};

const suggestionsContainerHeader = (props: ISuggestionsContainerComponentProps) => (
  <div>
    <Typography variant='subtitle1' style={{fontSize: 'inherit'}}><strong>Items Title</strong></Typography>
  </div>
);

const suggestionsContainerFooter = (props: ISuggestionsContainerComponentProps) => (
  <div>
    <Button variant='contained' size='small' onClick={clickHandler(props)}>Add Item</Button>
  </div>
);

function createEmployeesGrid1() {
  let cols: IColumn[] = observable([]);

  // add header columns
  cols.push(createColumn('name',                       'Employee',               {type: 'text', width: '120px'}));
  cols.push(createColumn('email',                      'Email',                  {type: 'text', width: '120px'}));
  cols.push(createColumn('isActive',                   'IsActive',               {type: 'checked', width: '75px'}));
  cols.push(createColumn('timeColumn',                 'Time',                   {type: {type: 'time'}, width: '150px'}));
  cols.push(createColumn('selectColumn',               'Select',                 {type: {type: 'select', options: countries}, width: '150px'}));
  cols.push(createColumn('multiselectColumn',          'Multiselect',            {type: {type: 'multiselect', options: countries}, width: '150px'}));
  cols.push(createColumn('autoCompleteColumn',         'Auto Complete',          {type: {type: 'auto-complete', options: countries}, width: '150px'}));
  cols.push(createColumn('advancedAutoCompleteColumn', 'Advanced Auto Complete', {type: {type: 'auto-complete', options: {search: countries.search, map: countries.map, suggestionsContainerHeader: suggestionsContainerHeader, suggestionsContainerFooter: suggestionsContainerFooter}}, width: '150px'}));
  cols.push(createColumn('multiAutoCompleteColumn',    'Multi Auto Complete',    {type: {type: 'multiselectautocomplete', options: countries}, width: '250px'}));

  // add employee rows
  let rows: IRowData[] = [];
  for (let row = 0; row < employees.length; row++) {
    let r: IRowData = { id: `${row}`, data: {}, options: { onClick: handleRowClick }};
    for (let column = 0; column < cols.length; column++) {
      let fieldName: string = cols[column].name;
      let v: any;
      if (fieldName === 'name') {
        v = employees[row][fieldName]; // somehow make into a button that opens a dialog on click???
      } else if (fieldName === 'multiselectColumn') {
        v = [{id: '14', name: 'Austria'}, {id: '21', name: 'Belgium'}];
      } else if (fieldName === 'multiAutoCompleteColumn') {
        v = [{id: '18', name: 'Bangladesh'}, {id: '19', name: 'Barbados'}];
      } else if (fieldName === 'advancedAutoCompleteColumn') {
        v = {id: '21', name: 'Belgium'};
      } else {
        v = employees[row][fieldName];
      }
      r.data![fieldName] = v;
    }
    rows.push(r);
  }

  // create the grid model
  const toggleItems: IToggleMenuItem[] = observable([
    {name: 'delete',    title: 'Delete', subheader: 'Grid Toggles', visible: true, onClick: (item: IToggleMenuItem) => { item.visible = !item.visible; } },
    {name: 'archive',   title: 'Archive',                           visible: true, onClick: (item: IToggleMenuItem) => { item.visible = !item.visible; } },
    {name: 'unarchive', title: 'Unarchive',                         visible: true, onClick: (item: IToggleMenuItem) => { item.visible = !item.visible; } },
  ]);
  let grid = createGrid(rows, cols, { multiSelect: true, allowMergeColumns: true, optionsMenuFn: () => ({ items: [...createColumnsToggleMenuItems(cols, ['timeColumn', 'email', 'isActive', 'autoCompleteColumn'], {onItemClick: toggleMenuHandleItemClick}), ...toggleItems] }) });
  // sort by employee names
  grid.addSort(cols[0], 'ascending');
  grid.headerRowHeight = 32;
  grid.rowHeight = 56;

  return grid;
}

function createEmployeesGrid2() {
  let cols: IColumn[] = observable([]);

  // add header columns
  cols.push(createColumn('name',                    'Employee',            {type: 'text', width: '120px'}));
  cols.push(createColumn('email',                   'Email',               {type: 'text', width: '120px'}));
  cols.push(createColumn('isActive',                'IsActive',            {type: 'checked', width: '75px'}));
  cols.push(createColumn('timeColumn',              'Time',                {type: {type: 'time'}, width: '150px'}));
  cols.push(createColumn('selectColumn',            'Select',              {type: {type: 'select', options: countries}, width: '100px'}));
  cols.push(createColumn('multiselectColumn',       'Multiselect',         {type: {type: 'multiselect', options: countries}, width: '250px'}));
  cols.push(createColumn('autoCompleteColumn',      'Auto Complete',       {type: {type: 'auto-complete', options: countries}, width: '100px'}));
  cols.push(createColumn('multiAutoCompleteColumn', 'Multi Auto Complete', {type: {type: 'multiselectautocomplete', options: countries}, width: '250px'}));
  cols.push(createColumn('numberColumn1',           'Number Column 1',     {type: {type: 'number', options: {}}, width: '120px'}));
  cols.push(createColumn('numberColumn2',           'Number Column 2',     {type: {type: 'number', options: {}}, width: '120px'}));
  cols.push(createColumn('numberColumn3',           'Number Column 3',     {type: {type: 'number', options: {}}, width: '120px'}));

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
        v = [{id: '14', name: 'Austria'}, {id: '21', name: 'Belgium'}];
      } else if (fieldName === 'multiAutoCompleteColumn') {
        v = [{id: '18', name: 'Bangladesh'}, {id: '19', name: 'Barbados'}];
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
  grid.addSort(cols[0], 'ascending');
  grid.headerRowHeight = 56;
  grid.rowHeight = 38;

  return grid;
}

let employeesGrid1 = createEmployeesGrid1();
let employeesGrid2 = createEmployeesGrid2();
employeesGrid1.setChangeTracking(true);
employeesGrid2.setChangeTracking(true);

// observable dates don't work, but not sure if they ever need to.
// let testDate = observable(new Date());
let mode = observable({
  gridMode: 'employees1',
});

const confirmationYesAction: ActionFn = () => {
  console.log('no way you chose that');
  yesNoModel.close();
  return true;
};

const confirmationNoAction: ActionFn = () => {
  console.log('solid choice');
  return true;
};

const yesAction: ActionFn = () => {
  confirmationModel.open();
  return false;
};

const yesNoModel        = new YesNoModel({ title: 'Confirmation Required', action: yesAction });
const confirmationModel = new ConfirmationModel({ title: 'Secondary Confirmation', yesAction: confirmationYesAction, noAction: confirmationNoAction});
grid.setChangeTracking(true);
console.log('grid has changes =', grid.hasChanges);
grid.onError = (row, field, error) => console.log(`${row.id} ${field} ${error && error.text}`);
root(() => {
  watch(() => grid.hasChanges, () => console.log(`grid has changes ${grid.hasChanges}`));
});


const HomeActionMenu = (props: any) => {
  const buttonContent               = <span>Action Menu</span>;
  const buttonProps: ButtonProps    = {color: 'primary', variant: 'contained'};
  const anchorOrigin: PopoverOrigin = {vertical: 'top', horizontal: 'left'};
  const transformOrigin             = anchorOrigin;
  const items: IActionMenuItem[]    = [
    {name: 'delete',    title: 'Delete',    icon: DeleteIcon,    onClick: () => { console.log('Performing Delete Action...'); },    closeOnClick: true},
    {name: 'archive',   title: 'Archive',   icon: ArchiveIcon,   onClick: () => { console.log('Performing Archive Action...'); },   closeOnClick: true},
    {name: 'unarchive', title: 'Unarchive', icon: UnarchiveIcon, onClick: () => { console.log('Performing Unarchive Action...'); }, closeOnClick: true},
  ];

  return (
    <ActionMenu
      title={() => <span>Action Menu</span>}
      menuId='home-action-menu'
      items={items}
      buttonContent={buttonContent}
      buttonProps={buttonProps}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      classes={{menuButton: props.classes.menuButton}}
    />
  );
};

const HomeToggleMenu = (props: any) => {
  const buttonContent               = <span>Toggle Menu</span>;
  const buttonProps: ButtonProps    = {color: 'primary', variant: 'contained'};
  const anchorOrigin: PopoverOrigin = {vertical: 'top', horizontal: 'left'};
  const transformOrigin             = anchorOrigin;
  const items: IToggleMenuItem[]    = observable([
    {name: 'toggle1', title: 'Toggle 1', visible: true},
    {name: 'toggle2', title: 'Toggle 2', visible: true},
    {name: 'toggle3', title: 'Toggle 3', visible: true},
  ]);
  return (
    <ToggleMenu
      title='Toggle Menu'
      menuId='home-toggle-menu'
      buttonContent={buttonContent}
      buttonProps={buttonProps}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      items={items}
      classes={{menuButton: props.classes.menuButton}}
    />
  );
};

const styles = () => ({
  dialogButtonsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px',
  },
  openDialogButton: {
    marginRight: '15px',
  },
  gridsSection: {
    overflow: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px',
  },
  gridActionButtonsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridActionButton: {
    margin: '0px 15px 10px 0px',
  },
  gridContainer: {
    padding: '20px',
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  employeesGridButtonsContainer: {
    display: 'flex',
    marginBottom: '10px',
  },
  employeesGridButton: {
    marginRight: '10px',
  },
  dataGrid: {
    height: '650px',
    '& td.readOnly': {
      color: '#869ba5',
      fontStyle: 'italic',
    }
  },
  employeeGrid: {
    height: '400px',
  },
});

type HomeViewProps = WithStyle<ReturnType<typeof styles>>;
function setValue(row: IRow, obj: any) {
  for (const [key, value] of Object.entries(obj)) {
    const cell = row.cells[key];
    if (cell) cell.value = value;
  }
}

export const HomeView = React.memo(withStyles(styles, (props: HomeViewProps) => {
  const {classes} = props;

  return (
    <Observe render={() => (
      // <TransitionWrapper>
      <div>
        <div className={classes.dialogButtonsContainer}>
        <Button className={classes.openDialogButton} color='primary' variant='contained' onClick={() => sampleModel.open()}>Load Dialog Test</Button>
        <Button className={classes.openDialogButton} color='primary' variant='contained' onClick={() => hotkeysModel.open()}>Load Grid Hotkeys List</Button>
        <Button className={classes.openDialogButton} color='primary' variant='contained' onClick={() => yesNoModel.open()}>Load Confirmation Dialog</Button>

        <HomeActionMenu classes={{menuButton: classes.openDialogButton}} />
        <HomeToggleMenu classes={{menuButton: classes.openDialogButton}} />

        <input
          style={{display: 'none'}}
          accept='image/*'
          id='contained-button-file'
          type='file'
          onChange={({ target: { validity, files } }) => {
            validity.valid && uploadFile(files![0]);
          }}
        />
        <label htmlFor='contained-button-file'>
          <Button className={classes.openDialogButton} color='primary' variant='contained' component='span'>
            Upload
          </Button>
        </label>
        </div>

        <SampleDialog />
        <HotKeysDialog />

        <ConfirmationDialog viewModel={confirmationModel} />
        <YesNoDialog viewModel={yesNoModel}>
          <Typography variant='h5'>Do you wish to delete your entire hard drive?</Typography>
          <Typography variant='h6'>Please think before you answer</Typography>
        </YesNoDialog>

        <div className={classes.gridsSection}>
          <div className={classes.gridActionButtonsContainer}>
            <Button className={classes.gridActionButton} variant='contained' onClick={() => grid.selectCellByPos(0, 4)}>Select Cell</Button>
            <Button className={classes.gridActionButton} variant='contained' onClick={() => grid.selectCellsByRange(1, 4, 3, 5)}>Select Cells</Button>
            <Button className={classes.gridActionButton} variant='contained' onClick={() => {
              grid.addRow({id: 'newRow-' + Math.random() * 2000, data: {column2: 'RC 2-1', column3: 'RC 3-1'}});
              employeesGrid1.addRow({id: 'newRow-' + Math.random() * 2000, data: {name: 'New Employee', email: 'employeeEmail@test.com'}});
            }}>
              Add Row
            </Button>
            <Button className={classes.gridActionButton} variant='contained' onClick={() => grid.removeRow(grid.rows[grid.rows.length - 1].id)}>Remove Row</Button>
            <Button className={classes.gridActionButton} variant='contained' onClick={() => grid.rows.forEach(row => row.cells['numberColumn'].value = 1337)}>Change Number Cell Value</Button>
            <Button className={classes.gridActionButton} variant='contained' onClick={() => grid.rows.forEach(row => setValue(row, {'numberColumn': 2222, 'dateColumn': '1985-11-26'}))}>Change Number And Date Cells</Button>
            <Button className={classes.gridActionButton} variant='contained' onClick={() => grid.rows.forEach(row => row.clear(['numberColumn', 'dateColumn']))}>Clear Number And Date</Button>
            <Button className={classes.gridActionButton} variant='contained' onClick={() => grid.rows.forEach(row => row.cells['complexColumn'].value = new ComplexCellData('smithers027', 'Smithers', 57))}>
              Change Complex Cell Value
            </Button>
          </div>
          <div className={classes.gridActionButtonsContainer}>
            <Observe render={() => (<Button className={classes.gridActionButton} variant='contained' onClick={() => { grid.column('column1')!.visible = !grid.column('column1')!.visible; }}> Toggle Column</Button>)} />
            <Observe render={() => (<Button className={classes.gridActionButton} variant='contained' disabled={!grid.hasErrors()}>Enabled if has Errors</Button>)} />
            <Observe render={() => (<Button className={classes.gridActionButton} variant='contained' onClick={() => console.log(grid.get())}> Save All</Button>)} />
          </div>

          <Paper className={classes.gridContainer}>
            <Observe render={() => (<Grid grid={grid} gridFontSizes={{header: '0.9rem', body: '0.9rem', groupRow: '0.9rem', toggleMenu: '0.9rem'}} className={classes.dataGrid} />)} />
          </Paper>
          <Observe render={() => (
            <Paper className={classes.gridContainer}>
              <div className={classes.employeesGridButtonsContainer}>
                <Button className={classes.employeesGridButton} onClick={() => mode.gridMode = 'employees1'} variant='outlined'>Grid 1</Button>
                <Button className={classes.employeesGridButton} onClick={() => mode.gridMode = 'employees2'} variant='outlined'>Grid 2</Button>
              </div>
              <Grid key={mode.gridMode} grid={mode.gridMode === 'employees1' ? employeesGrid1 : employeesGrid2} gridFontSizes={{header: '0.95rem', body: '0.95rem', groupRow: '0.95rem', toggleMenu: '0.95rem'}} className={classes.employeeGrid} />
            </Paper>
          )} />
        </div>
      </div>
      // </TransitionWrapper>
    )} />
  );
}));
