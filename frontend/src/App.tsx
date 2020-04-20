import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect,
  useLocation,
} from "react-router-dom";
import MyEntriesPage from './pages/inshell/MyEntries'
import AllEntriesPage from './pages/inshell/AllEntries'
import AllUsersPage from './pages/inshell/AllUsers'
import MyUserPage from './pages/inshell/MyUser'
import LoginPage from './pages/fullwidth/Login';
import RegisterPage from './pages/fullwidth/Register';
import PageNotFoundPage from './pages/fullwidth/404';
import AboutPage from './pages/inshell/About';

import authenticationService from './services/auth'
import hooks from './services/hooks'
import user from './services/user'

import { FaClock, FaUserFriends, FaRegClock, FaUserCircle } from "react-icons/fa";

function useForceUpdate(){
  const [ _, setValue ] = useState( 0 ); // integer state
  return () => setValue( value => ++value ); // update the state to force render
}

function App() {
  hooks.forceUpdateApp = useForceUpdate();
  return (
    <div className="App">
      <Router>
        <AppMenu />
        <AppPage />
      </Router>
    </div>
  );
}

function AppMenu() {
  const loggedIn = authenticationService.isLoggedIn();
  return ! loggedIn ? <></> : (
    <div className="navigation-bar">
      <NavLink className="home" exact to="/"><button> TOPTAL </button></NavLink>
      { user.canViewPage( "my-entries" ) && 
        <NavLink activeClassName="active" exact to="/my-entries"><button><FaClock/></button></NavLink> }
      { user.canViewPage( "all-users" ) && 
        <NavLink activeClassName="active" exact to="/all-users"><button><FaUserFriends/></button></NavLink> }
      { user.canViewPage( "all-entries" ) && 
        <NavLink activeClassName="active" exact to="/all-entries"><button><FaRegClock/></button></NavLink> }
      <div style={{ flexGrow: 1 }}></div>
      { user.canViewPage( "my-user" ) && 
        <NavLink activeClassName="active" exact to="/my-user"><button><FaUserCircle/></button></NavLink> }
    </div>
  );
}

function AppPage() {
  const loggedIn = authenticationService.isLoggedIn();
  return (
    <div className={ "page-content " + useLocation().pathname.substr(1) }>
        { ! loggedIn ? (
            <Switch>
              <Route exact path="/login" component={ LoginPage } />
              <Route exact path="/register" component={ RegisterPage } />
              <Redirect to="/login"/>
            </Switch>
          ) : (
            <Switch>
              <Route exact path="/" component={ AboutPage } />
              <Route path="/my-entries" component={ MyEntriesPage } />
              <Route path="/all-users" component={ AllUsersPage } />
              <Route path="/all-entries" component={ AllEntriesPage } />
              <Route path="/my-user" component={ MyUserPage } />
              <Redirect exact from="/" to="/my-entries"/>
              <Redirect exact from="/login" to="/"/>
              <Redirect exact from="/register" to="/"/>
              <Route component={ PageNotFoundPage } />
            </Switch>
        ) }
    </div>
  );
}

export default App;
