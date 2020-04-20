import React from 'react'
import { useHistory } from "react-router-dom";

import authenticationService from '../services/auth'

function LogoutButton() {
  let history = useHistory();
  return (
    <h2
      className="App-link"
      onClick={() => authenticationService.signout().then( () => history.push("/login") ) }
    >
      Log outta here...
    </h2>
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