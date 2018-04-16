import * as React            from 'react';
import * as ReactDOM         from 'react-dom';
import {AutoComplete}        from 'rewire-ui';
import {
  arraySearch,
  documentSearch
}                            from 'rewire-ui';
import {Select}              from 'rewire-ui';
import { observable, watch } from 'rewire-core';
import {Observe}             from 'rewire-core';
import {fetch}               from 'rewire-common';
// import TextField          from 'material-ui/TextField';
import {TextField}           from 'rewire-ui';
import {NumberField}         from 'rewire-ui';
import Button                from 'material-ui/Button';
import Typography            from 'material-ui/Typography';
import { withStyles }        from 'material-ui/styles';
// import SortableContainer, {SortableList} from 'ui/components/Sortable';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
// import {TimeInputField} from 'rewire-ui';
import {utc}            from 'rewire-common';
// import Grid           from './components/Grid';
import Paper          from 'material-ui/Paper';
import Dialog         from 'material-ui/Dialog';
import {delay}        from 'rewire-common';
import {Loader}       from 'rewire-ui';
import * as is        from 'is';
import {Form}         from 'rewire-ui';
import { IObject }    from 'rewire-common';
import {Modal}        from 'rewire-ui';
import {Dialog as DialogView}   from 'rewire-ui';
import {FormView}     from 'rewire-ui';
// import column         from './models/Grid';
import {createGrid, createColumn}   from 'rewire-grid';
import {Grid}         from 'rewire-grid';
// import { ICell, collapseAll, expandAll } from 'rewire-grid/models/GridTypes';
import {editor}       from 'rewire-ui';
import {isRequired, isEmail, and, isSameAsOther} from 'rewire-ui';
import './graphqltest';

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

const searcher = arraySearch(['Yes', 'No', 'Maybe', 'Uncertain', 'Definitely Not']);
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

watch(() => ooga.date, () => console.log(ooga.date, utc(ooga.date).toTimestampString()));

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
setTimeout(() => { console.log('here'); suggestions2[0].name = 'error!!'; }, 5000);

class LoginDialog extends Modal {
  form = Form.create({
    email                : Form.string().label('Email').validators(and(isRequired, isEmail)).placeholder('enter a valid email').autoFocus(),
    password             : Form.string().label('Password').validators(and(isRequired, isSameAsOther('password_confirmation', 'passwords are not the same'))).placeholder('enter a password').editor('password'),
    password_confirmation: Form.string().label('Confirm Password').placeholder('confirm your password').editor('password'),
    country              : Form.reference(countries).label('Country').validators(isRequired).placeholder('ooga')
  }, {email: 'splace@worksight.net'});

  constructor() {
    super('Login Form');
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

watch(() => loginDialog.form.hasChanges, () => console.log('has changes =', loginDialog.form.hasChanges));
watch(() => loginDialog.form.hasErrors, () => console.log('has errors =', loginDialog.form.hasErrors));

const DialogLoginForm = () => (
  <DialogView dialog={loginDialog} maxWidth='md'>
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

watch(() => items1.items.length, () => console.log('test has changed'));

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

  // Override and set some columns to be number!
  cols[5].setEditor({type: 'number', options: {decimals: 2, thousandSeparator: true}});
  cols[6].setEditor({type: 'number', options: {decimals: 3, thousandSeparator: true}});

  // add some cell data!
  let rows = [];
  for (let row = 0; row < nRows; row++) {
    let r: any = {};
    for (let column = 0; column < nColumns; column++) {
      let v: any = `RC ${column}-${row % 5}`;
      if ((column >= 5) && (column <= 6)) v = Math.random() * 10000;
      r['column' + column] = v;
    }
    rows.push(r);
  }
  // Some fixed columns to the left
  cols[0].fixed = true;
  cols[0].width = '128px';
  cols[0].align = 'right';
  cols[1].fixed = true;
  cols[1].width = '65px';
  cols[1].align = 'right';

  // create the grid model and group by 'column2' and 'column3'
  let grid = createGrid(rows, cols, ['column2', 'column3']);
  grid.addFixedRow({column5: 'Sales', column6: 'Sales'});

  // sort first by  column7 then by column6
  grid.addSort(cols[7], 'ascending')
      .addSort(cols[6], 'descending');

  console.timeEnd('start tester'); // how long did it take to create the reactive model?
  return grid;
}

let grid = createTestGrid(40, 14);

let rrr = {column0: 'booga'};
// setTimeout(() => collapseAll(grid), 4000);
// setTimeout(() => expandAll(grid), 6000);
// setTimeout(() => S.freeze(() => grid.addRow(rrr)), 5000);
// setTimeout(() => grid.rows[0].cells['column0'].value = 'booga', 6000);
// setTimeout(() => grid.columns[3].visible = false, 7000);
// setTimeout(() => grid.columns[3].visible = true, 8000);

watch(() => {
  let r = grid.hasChanges();
}, () => console.log('has changes', grid.hasChanges()));

const _Home = (props: any) => (
  <div>
    <div>
      <Button color='primary' variant='raised' onClick={() => loginDialog.open()}>Load Dialog Test</Button>
      <LoginFormView form={loginDialog.form} />
      <DialogLoginForm />
      <DialogView dialog={confirmation}>
        <Typography style={{margin: 16}}>Are you sure you want to do this crazy shit?</Typography>
      </DialogView>
      <div style={{overflow: 'auto', padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Paper style={{width: '80%', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 800}}>
          <Grid grid={grid} />
        </Paper>
      </div>
    </div>
  </div>
);

const Home = _Home;


const About = () => (
  <div>
    <h2>About</h2>
  </div>
);

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