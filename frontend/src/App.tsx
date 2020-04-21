import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect,
  useLocation,
} from "react-router-dom";
import { FaClock, FaUserFriends, FaRegClock, FaUserCircle } from "react-icons/fa";

import './App.css';
import './styles/superhero/bootstrap.min.css';

import MyEntriesPage from './pages/inshell/MyEntries'
import AllEntriesPage from './pages/inshell/AllEntries'
import AllUsersPage from './pages/inshell/AllUsers'
import MyUserPage from './pages/inshell/MyUser'
import LoginPage from './pages/fullwidth/Login';
import RegisterPage from './pages/fullwidth/Register';
import PageNotFoundPage from './pages/fullwidth/404';
import AboutPage from './pages/inshell/About';

import api from './services/api';
import hooks from './services/hooks'
import authenticationService from './services/auth'
import ErrorBodyComponent from './components/ErrorBody';
import { MyUserContext, User } from './services/user';

window["hooks"] = hooks
window["auth"] = authenticationService

function App() {
  return (
    <div className="App">
      <Router>
        <AppRoutesWrapper />
      </Router>
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
          <Route exact path="/login" component={ LoginPage } />
          <Route exact path="/register" component={ RegisterPage } />
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
  hooks.setMyUserData = setMyUserData

  const location = useLocation();

  function canViewPage( page:"my-entries"|"all-entries"|"all-users"|"my-user" ) {
    const myrole = myUser?.role || 0
    switch ( page ) {
      case "my-entries": return myrole >= 1
      case "all-users": return myrole >= 5
      case "all-entries": return myrole >= 9
      case "my-user": return !! myUser
      default: return false
    }
  }

  useEffect( () => {
    console.log( "First run!" )
    api.request( "/me", "get" )
      .then( data => {
        setMyUserData( data.user )
      } )
      .catch( error => {
        setError( error )
      } )
  }, [] );

  if ( error ) 
    return <ErrorBodyComponent error={ error }/>;

  const PageContent = () => {
    if ( ! myUser )
      return null
    return (
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
      {/* <PageContent /> */}
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
