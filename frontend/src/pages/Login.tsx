import React from "react"
import logo from '../logo.svg';
import { useHistory } from "react-router-dom";

import authenticationService from '../services/auth'

export default function LoginPage() {
  const history = useHistory();
  const auth = authenticationService.authenticate;
  return (
    <div>
      <p>
        <img src={logo} className="App-logo" alt="logo" />
      </p>
      <p> 
        You need to be a registered user to view this content.
      </p>
      <p className="App-link"
        onClick={() => auth().then( () => history.push("/") ) }
      >
        Please log in...
      </p>
    </div>
  )
}