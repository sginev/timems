import React, { useState } from 'react';
import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect,
  useHistory,
  // useLocation
} from "react-router-dom";
import MyEntriesPage from './pages/MyEntries'
import AllEntriesPage from './pages/AllEntries'
import AllUsersPage from './pages/AllUsers'
import MyUserPage from './pages/MyUser'
import LoadingPage from './pages/Loading';
import LoginPage from './pages/Login';
import PageNotFoundPage from './pages/404';

import fakeAuthenticationService from './services/auth'
import hooks from './services/hooks'

import { FaHome, FaClock, FaUserFriends, FaRegClock, FaUserCircle } from "react-icons/fa";

function useForceUpdate(){
  const [ _, setValue] = useState(0); // integer state
  return () => setValue( value => ++value ); // update the state to force render
}

function App() {
  hooks.forceUpdateApp = useForceUpdate();
  const loggedIn = fakeAuthenticationService.isLoggedIn();
  return (
    <div className="App">
      <Router>
        {/* <header className="App-header">
        </header> */}
        { loggedIn &&
          <div className="navigation-bar">
            {/* <NavLink activeClassName="active" exact to="/"><button><FaHome/></button></NavLink> */}
            <NavLink activeClassName="active" exact to="/my-entries"><button><FaClock/></button></NavLink>
            <NavLink activeClassName="active" exact to="/all-users"><button><FaUserFriends/></button></NavLink>
            <NavLink activeClassName="active" exact to="/all-entries"><button><FaRegClock/></button></NavLink>
            <NavLink activeClassName="active" exact to="/my-user"><button><FaUserCircle/></button></NavLink>
          </div>
        }
        <div className="page-content">
            { ! loggedIn ? (
                <Switch>
                  <Route exact path="/login" component={ LoginPage } />
                  <Redirect to="/login"/>
                </Switch>
              ) : (
                <>
                <Switch>
                  {/* <Route exact path="/" component={ LoadingPage } /> */}
                  <Route path="/my-entries" component={ MyEntriesPage } />
                  <Route path="/all-users" component={ AllUsersPage } />
                  <Route path="/all-entries" component={ AllEntriesPage } />
                  <Route path="/my-user" component={ MyUserPage } />
                  <Redirect exact from="/" to="/my-entries"/>
                  <Route component={ PageNotFoundPage } />
                </Switch>
                </>
            ) }
        </div>
      </Router>
    </div>
  );
}

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      { ...rest }
      render={({ location }) =>
        fakeAuthenticationService.isLoggedIn() ? (
          <Component />
        ) : (
            <Redirect to={{ pathname: "/login", state: { from: location } }} />
          )
      }
    />
  );
}

export default App;
