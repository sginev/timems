import React from "react"
import logo from './logo.svg';
import { useHistory } from "react-router-dom";

import authenticationService from '../../services/auth'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export default function RegisterPage() {
  const history = useHistory();
  const auth = authenticationService.authenticate;
  const handleSubmit = async e => {
    e.preventDefault()
    await auth();
    history.push("/");
  }
  const values = {
    username : '',
    password : '',
  };
  return (
    <div>
      <p> <img src={logo} className="App-logo" alt="logo" /> </p>
      {/* <p> You need to be a registered user to view this content. </p> */}
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
            required 
            type="password" 
            onChange={ e => values.password = e.target.value }
            placeholder="Password" />
        </Form.Group>
        <Form.Group controlId="formBasicPasswordConfirm">
          <Form.Label>Confirm password</Form.Label>
          <Form.Control 
            required 
            type="password" 
            // isValid={ values.password == touched }
            placeholder="Confirm password" />
        </Form.Group>
        <Button variant="primary" type="submit">
          Create account
        </Button>
      </Form>

      <br/>
      <p className="App-link" onClick={ () => history.push("/login") } >
        Do you already have an account?
      </p>

    </div>
  )
}