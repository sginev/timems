import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect,
  useLocation,
  useHistory,
} from "react-router-dom";
import { ToastProvider, useToasts } from 'react-toast-notifications';
import { FaClock, FaUserFriends, FaRegClock, FaUserCircle } from "react-icons/fa";

import './App.css';
import './themes/superhero/bootstrap.min.css';

import MyEntriesPage from './pages/inshell/MyEntries'
import AllEntriesPage from './pages/inshell/AllEntries'
import AllUsersPage from './pages/inshell/AllUsers'
import MyUserPage from './pages/inshell/MyUser'
import LoginPage from './pages/fullwidth/Login';
import PageNotFoundPage from './pages/fullwidth/404';
import AboutPage from './pages/inshell/About';

import api from './services/api';
import hooks from './services/hooks'
import authenticationService from './services/auth'
import ErrorBodyComponent from './components/ErrorBody';
import { MyUserContext, User } from './services/user';
import { UserRole } from 'shared/interfaces/UserRole';
import AccessController from 'shared/authorization/AccessController';

const access = new AccessController();

function App() {
  return (
    <div className="App">
      <ToastProvider autoDismiss placement="top-center">
        <Router>
          <AppRoutesWrapper />
        </Router>
      </ToastProvider>
    </div>
  );
}

function AppRoutesWrapper() {
  const location = useLocation();
  const loggedIn = authenticationService.isLoggedIn();
  if( ! loggedIn ) {
    return (
      <div className={ "page-content " + location.pathname.substr(1) }>
        <Switch>
          <Route exact path="/(login|register)" component={ LoginPage } />
          <Redirect to="/login"/>
        </Switch>
      </div>
    )
  }
  return <AppMemberContent />
}

function AppMemberContent() {
  const [ myUser, setMyUserData ] = useState<User|null>( null );
  const [ error, setError ] = useState<Error|null>( null );
  const { addToast } = useToasts();
  const history = useHistory();
  const location = useLocation();
  hooks.setMyUserData = setMyUserData

  function canViewPage( page:"my-entries"|"all-entries"|"all-users"|"my-user" ) {
    if ( !myUser )
      return false;
    switch ( page ) {
      case "my-user":     return access.canViewOwnUser( myUser );
      case "my-entries":  return access.canViewOwnEntries( myUser );
      case "all-users":   return access.canViewAllUsers( myUser );
      case "all-entries": return access.canViewAllEntries( myUser );
      default: return false
    }
  }

  useEffect( () => {
    console.log( "First run!" );
    ( async () => {
      try {
        const data = await api.request( "/me", "get" );
        setMyUserData( data.user );
      } catch ( error ) {
        console.error( error );
        addToast( error.message, { appearance: 'error' } );
        await authenticationService.logout();
        history.push("/login");
      }
    } )()
  }, [] );

  if ( error ) 
    return <ErrorBodyComponent error={ error }/>;

  return (
    <>
      <div className="navigation-bar">
        <NavLink className="home" exact to="/"><button> TOPTAL </button></NavLink>
        { canViewPage( "my-entries" ) && 
          <NavLink activeClassName="active" exact to="/my-entries"><button><FaRegClock/></button></NavLink> }
        { canViewPage( "all-entries" ) && 
          <NavLink activeClassName="active" exact to="/all-entries"><button><FaClock/></button></NavLink> }
        { canViewPage( "all-users" ) && 
          <NavLink activeClassName="active" exact to="/all-users"><button><FaUserFriends/></button></NavLink> }
        <div style={{ flexGrow: 1 }}></div>
        { canViewPage( "my-user" ) && 
          <NavLink activeClassName="active" exact to="/my-user"><button><FaUserCircle/></button></NavLink> }
        <div className="tiny-name">{ myUser?.username || '' }</div>
      </div>
      {
        myUser && (
          <div className={ "page-content " + location.pathname.substr(1) }>
            <MyUserContext.Provider value={ myUser }>
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
            </MyUserContext.Provider>
          </div>
        )
      }
    </>
  )
}

export default App;
