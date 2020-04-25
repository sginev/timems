import React, { useState } from "react"
import logo from './logo.svg';
import { useHistory } from "react-router-dom";
import { useToasts } from 'react-toast-notifications'

import authenticationService from '../../services/auth'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const defaultValues = { username : '', password : '' }

export default function LoginPage() {
  const history = useHistory();
  const { addToast } = useToasts()
  const [ values, setValues ] = useState( defaultValues );

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await authenticationService.login( values.username, values.password );
      setValues(defaultValues);
      history.push("/");
    } catch ( e ) {
      addToast( e.message, { appearance: 'error' } )
    }
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
              onChange={ e => values.username = e.target.value }
              placeholder="Enter username" />
          </Form.Group>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              // required 
              type="password" 
              onChange={ e => values.password = e.target.value }
              placeholder="Password" />
          </Form.Group>
          <Button variant="primary" type="submit">
            Log in
          </Button>
        </Form>
      </div>

      <br/>
      <br/>
      
      <p className="App-link" onClick={ () => history.push("/register") } >
        Are you a new user?
      </p>
    </>
  )
}