import React from 'react'
import { useHistory } from "react-router-dom";

import fakeAuthenticationService from '../services/auth'

function LogoutButton() {
  let history = useHistory();
  return (
    <a
      href="#"
      className="App-link"
      rel="noopener noreferrer"
      onClick={() => fakeAuthenticationService.signout().then( () => history.push("/login") ) }
    >
      <h2>
        Log outta here...
      </h2>
    </a>
  )
}

class MyUserPage extends React.Component {
  render() {
    return ( 
      <div>
        <LogoutButton />
      </div>
    )
  }
}
export default MyUserPage