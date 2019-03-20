import * as React     from 'react';
import * as ReactDOM  from 'react-dom';
import { HomeView }   from './HomeView';
import { AboutView }  from './AboutView';
import { TopicsView } from './TopicsView';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const listStyle = ({
  listStyleType: 'none'
});

const listItemStyle = {
  display:      'inline',
  paddingLeft:  '10px',
  paddingRight: '10px'
};

const BasicExample = (props: any) => {
  return (
    <Router>
      <div>
        <ul style={listStyle}>
          <li style={listItemStyle}><Link to='/'>Home</Link></li>
          <li style={listItemStyle}><Link to='/about'>About</Link></li>
          <li style={listItemStyle}><Link to='/topics'>Topics</Link></li>
        </ul>
        <hr/>
        <Route exact path='/'       component={HomeView}/>
        <Route       path='/about'  component={AboutView}/>
        <Route       path='/topics' component={TopicsView}/>
      </div>
    </Router>
  );
};

// async function login() {
  // await fetch.post('accounts/login', { username: 'Administrator', password: '324#$as(lkf)' });
  let theme = createMuiTheme({typography: {useNextVariants: true}});
  ReactDOM.render(<MuiThemeProvider theme={theme}><BasicExample /></MuiThemeProvider>, document.getElementById('root'));
// }

// login();

export default BasicExample;

/*

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

*/
