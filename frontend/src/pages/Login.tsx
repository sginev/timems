import React from "react"
import logo from '../logo.svg';
import { useHistory } from "react-router-dom";

import fakeAuthenticationService from '../services/auth'

// export default class LoginPage extends React.Component {
//   constructor(props: {}) {
//     super(props)
//     this.state = {
//       done: undefined
//     }
//   }
//   render() {
//     let history = useHistory();
//     return (
//       <div>
//         <p>
//           <img src={logo} className="App-logo" alt="logo" />
//         </p>
//         <a
//           href=""
//           className="App-link"
//           rel="noopener noreferrer"
//           onClick={() => fakeAuthenticationService.authenticate(() => history.push("/")) }
//         >
//           Please Log in...
//         </a>
//       </div>
//     )
//   }
// }

export default function LoginPage() {
  let history = useHistory();
  return (
    <div>
      <p>
        <img src={logo} className="App-logo" alt="logo" />
      </p>
      <p> 
        You need to be a registered user to view this content.
      </p>
      <a
        href="#"
        className="App-link"
        rel="noopener noreferrer"
        onClick={() => fakeAuthenticationService.authenticate().then( () => history.push("/") ) }
      >
        Please log in...
      </a>
    </div>
  )
}