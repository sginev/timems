import React, { useState } from "react"
import logo from './logo.svg';
import { useHistory, useLocation } from "react-router-dom";
import { useToasts } from 'react-toast-notifications'

import authenticationService from '../../services/auth'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const viewConf = [
  {
    pathname : '/login',
    modeSwitchText : "Are you a new user?",
    modeSwitchPath : '/register',
    submitButtonText : "Sign in"
  } , 
  {
    pathname : '/register',
    modeSwitchText : "Do you already have an account?",
    modeSwitchPath : '/login',
    submitButtonText : "Sign up"
  } , 
]

const defaultValues = { username : '', password : '', passwordConfirmation : '' }

export default function LoginPage() {
  const history = useHistory();
  const location = useLocation();
  const { addToast } = useToasts();
  const [ values, setValues ] = useState( defaultValues );

  const newUser = location.pathname === viewConf[1].pathname;
  const conf = viewConf[ newUser ? 1 : 0 ]

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const authenticate = newUser ? authenticationService.register : authenticationService.login;
      await authenticate( values.username, values.password );
      setValues(defaultValues);
      history.push("/");
    } catch ( e ) {
      addToast( e.message, { appearance: 'error' } )
    }
  }

  function onChangeValues( newValues ) {
    setValues({ ...values, ...newValues })
  }

  function switchMode() {
    history.push( conf.modeSwitchPath );
  }

  return (
    <>
      <p> <img src={logo} className="App-logo" alt="logo" /> </p>
      
      <div style={{ maxWidth:"800px" }}>
        <Form onSubmit={ handleSubmit }>
          <Form.Group controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control 
              required 
              type="text" 
              onChange={ e => onChangeValues({ username : e.target.value }) }
              placeholder="Enter username" />
          </Form.Group>
          { ! newUser ? (
            <>
              {/* The key makes sure the field resets if you switch to registration mode. */}
              <Form.Group controlId="formLoginPassword" key='loginPass'> 
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  // required 
                  type="password" 
                  onChange={ e => onChangeValues({ password : e.target.value }) }
                  placeholder="Password" />
              </Form.Group>
            </>
          ) : (
            <>
              {/* The key makes sure the field resets if you switch to login mode. */}
              <Form.Group controlId="formRegistrationPassword" key='registerPass'>
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  // required 
                  type="password" 
                  onChange={ e => onChangeValues({ password : e.target.value }) }
                  placeholder="Password" />
              </Form.Group>
              <Form.Group controlId="formRegistrationPasswordConfirmation">
                <Form.Label>Confirm password</Form.Label>
                <Form.Control 
                  required 
                  type="password" 
                  isValid={ values.passwordConfirmation === values.password }
                  onChange={ e => onChangeValues({ passwordConfirmation : e.target.value }) }
                  placeholder="Confirm password" />
              </Form.Group>
            </>
          ) }
          <Button variant="primary" type="submit">
            { conf.submitButtonText }
          </Button>
        </Form>
      </div>

      <br/>
      <br/>
      
      <p className="App-link" onClick={ switchMode }>{ conf.modeSwitchText }</p>
    </>
  )
}