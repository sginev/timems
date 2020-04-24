import React from "react"
import logo from './logo.svg';
import { useHistory } from "react-router-dom";

import authenticationService from '../../services/auth'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export default function LoginPage() {
  const history = useHistory();
  const handleSubmit = async e => {
    e.preventDefault()
    await authenticationService.login( values.username, values.password );
    history.push("/");
  }
  const values = {
    username : '',
    password : '',
  };
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