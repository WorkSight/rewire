import * as React     from 'react';
import * as ReactDOM  from 'react-dom';
import CssBaseline    from '@material-ui/core/CssBaseline';
import Divider        from '@material-ui/core/Divider';
import { HomeView }   from './HomeView';
import { AboutView }  from './AboutView';
import { TopicsView } from './TopicsView';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { value, DataSignal, observable, sample, watch } from 'rewire-core';
import * as deepEqual from 'fast-deep-equal';

const listStyle = ({
  listStyleType: 'none',
  margin: '0px',
  padding: '20px',
});

const listItemStyle = {
  display: 'inline',
  paddingLeft:  '10px',
  paddingRight: '10px'
};

const contentContainerStyle = {
  padding: '0px 20px',
};

class ChangeTracker {
  private _hasChanges    : DataSignal<boolean> = value(false);
  private _original?     : any[];
  private _working?      : any[];
  private _recalculating : boolean = false;
  public  _dirty         : boolean = false
  constructor(private isCompleteFn: (obj: any) => boolean = () => true) {
  }

  set(rows: any[]) {
    this._hasChanges(false);
    this._dirty    = false;
    this._working  = rows;
    this._original = JSON.parse(JSON.stringify(rows));
  }

  public equals() {
    if (!this._dirty || !this._original || !this._working) return true;
    let oidx = 0;
    for (let widx = 0; widx < this._working.length; widx++) {
      const working  = this._working[widx];
      if (!this.isCompleteFn(working))  continue;
      if (oidx >= this._original.length) return false;
      const original = this._original[oidx++];
      if (!this.isCompleteFn(original)) continue;
      if (!deepEqual(working, original)) return false;
    }
    return true;
  }

  public get hasChanges() {
    return this._hasChanges();
  }

  recalculate() {
    if (!this._dirty || !this._original || !this._working) return;
    if (this._recalculating) return;
    this._recalculating = true;
    requestAnimationFrame(() => {
      this._hasChanges(!this.equals());
      this._recalculating = false;
    });
  }
}

function sample2() {
  let rows: any[] = observable([]);
  for (let index = 0; index < 100; index++) {
    const row = {id: String(index)};
    for (let c = 0; c < 30; c++) {
      row[`column_${c}`] = `row ${index} col ${c}`;
      row['nested'] = {ooga: 'ooga', booga: 'booga'};
    }
    rows.push(row);
  }
  return rows;
}

const rows = sample2();
const ct = new ChangeTracker();
// const ct = new ChangeTracker((v: Object) => !v.hasOwnProperty('ooga'));
watch(() => ct.hasChanges, () => console.log('different'));
console.time('ct');
ct.set(rows);
const eq = ct.equals();
ct.recalculate();
console.timeEnd('ct');
console.log(eq);
rows.push({ooga: 'ooga'});
// ct.recalculate();
// rows.pop();
ct.recalculate();
console.log(ct.equals());


// // console.time('ooga');

// const rows = freeze(() => sample());
// function watchAll(obj: any[], cb: () => void) {
//   let disposeDataWatcher:  (() => void) | undefined;
//   let disposeArrayWatcher: () => void;

//   function watchData() {
//     disposeDataWatcher && disposeDataWatcher();
//     root((dispose) => {
//       disposeDataWatcher = dispose;
//       for (let idx = 0; idx < obj.length; idx++) {
//         watch<number>((id: number) => {
//           version(obj[idx]);
//           return idx;
//         }, (id: number) => {
//           console.log(`row ${id} changed`);
//           cb();
//         }, idx);
//       }
//     });
//   }
//   let queued = false;
//   root((dispose) => {
//     disposeArrayWatcher && disposeArrayWatcher();
//     disposeArrayWatcher = dispose;
//     watch(() => {
//       version(obj);
//     }, () => {
//       if (queued) return;
//       queued = true;
//       disposeDataWatcher && disposeDataWatcher();
//       disposeDataWatcher = undefined;
//       requestAnimationFrame(() => {
//         watchData();
//         queued = false;
//         cb();
//       });
//     });
//   });
//   requestAnimationFrame(() => watchData());
// }

// const rs = [...rows];
// rs.push('ogoa');
// console.time('deepEqual');
// const result = deepEqual(rows, rs);
// console.timeEnd('deepEqual');
// console.log('deepequal = ', result);


// const rows = sample();
// console.log(rows)
// watchAll(rows, () => console.log('changed'));
// setTimeout(() => rows[4].column_4 = 'ooga', 3000);
// setTimeout(() => rows[78].nested.booga = 'oh no', 6000);
// setTimeout(() => {
//   for(let i = 0; i < 20; i++) {
//     rows.push({blah: 'blah'});
//   }
// }, 8000);

// console.timeEnd('ooga');

const BasicExample = (props: any) => {
  return (
    < >
    <CssBaseline />
    <Router>
      <div>
        <ul style={listStyle}>
          <li style={listItemStyle}><Link to='/'>Home</Link></li>
          <li style={listItemStyle}><Link to='/about'>About</Link></li>
          <li style={listItemStyle}><Link to='/topics'>Topics</Link></li>
        </ul>
        <Divider />
        <div style={contentContainerStyle}>
          <Route exact path='/'       component={HomeView}/>
          <Route       path='/about'  component={AboutView}/>
          <Route       path='/topics' component={TopicsView}/>
        </div>
      </div>
    </Router>
    </>
  );
};

// async function login() {
  // await fetch.post('accounts/login', { username: 'Administrator', password: '324#$as(lkf)' });
  let theme = createMuiTheme({typography: {useNextVariants: true}});
  ReactDOM.render(<MuiThemeProvider theme={theme}><BasicExample /></MuiThemeProvider>, document.getElementById('root'));
// }

// login();

export default BasicExample;
