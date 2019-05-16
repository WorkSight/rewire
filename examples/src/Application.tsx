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
import { observable } from 'rewire-core';
import { useObserver } from 'rewire-core/src/useObserver';
import { memo } from 'react';

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

const xxx = observable({name: 'sandy'});

const Test = memo((props) => useObserver(() => <div>{xxx.name}</div>));
setTimeout(() => xxx.name = 'douglas', 5000);
setTimeout(() => xxx.name = 'ryan', 8000);

const BasicExample = (props: any) => {
  return (
    < >
    <Test />
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
