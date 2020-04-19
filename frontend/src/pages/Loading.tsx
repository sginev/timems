import React from "react"
import logo from '../logo.svg';

export default class LoadingPage extends React.Component {
  constructor( props:{} ){
     super(props)
     this.state = {
        done: undefined
     }
  }
  render(){
     return(
       <div>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Loading...
        </p>
      </div>
     )
  }
}