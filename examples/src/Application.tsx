import React              from 'react';
import ReactDOM           from 'react-dom/client';
import CssBaseline        from '@material-ui/core/CssBaseline';
import Divider            from '@material-ui/core/Divider';
import { HomeView }       from './HomeView';
import { AboutView }      from './AboutView';
import { TopicsView }     from './TopicsView';
import { TypographyView } from './TypographyView';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';
import { MuiThemeProvider, createTheme }         from '@material-ui/core/styles';

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

const BasicExample = (_props: any) => {
  return (
    < >
    <CssBaseline />
    <Router>
      <div>
        <ul style={listStyle}>
          <li style={listItemStyle}><Link to='/'>Home</Link></li>
          <li style={listItemStyle}><Link to='/about'>About</Link></li>
          <li style={listItemStyle}><Link to='/topics'>Topics</Link></li>
          <li style={listItemStyle}><Link to='/typography'>Typography</Link></li>
        </ul>
        <Divider />
        <div style={contentContainerStyle}>
          <Route exact path='/'           component={HomeView}/>
          <Route       path='/about'      component={AboutView}/>
          <Route       path='/topics'     component={TopicsView}/>
          <Route       path='/typography' component={TypographyView}/>
        </div>
      </div>
    </Router>
    </>
  );
};

// async function login() {
  // await fetch.post('accounts/login', { username: 'Administrator', password: '324#$as(lkf)' });
const theme = createTheme();
ReactDOM.createRoot(document.getElementById('root')!).render(<MuiThemeProvider theme={theme}><BasicExample /></MuiThemeProvider>);
// }

// login();

export default BasicExample;
