import React, { useState } from 'react'
import { useHistory } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import user from '../../services/user'
import authenticationService from '../../services/auth'
import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';

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

function MyUserPage() {
  const [ workHoursPerDay, setWorkHoursPerDay ] = useState( user.workHoursPerDay )
  const [ username, setUsername ] = useState( user.username )
  const workHoursPerDayVisual = (
    ( ~~workHoursPerDay ) + " hours" + 
    ( 
      workHoursPerDay % 1.0 === 0.0 ? '' :
      ( ' ' + ( workHoursPerDay % 1.0 ) * 60 + ' minutes' ) 
    )
  )
  const handleSubmit = async e => {
    e.preventDefault()
    user.workHoursPerDay = workHoursPerDay;
    user.username = username
  }
  const dirty = 
    username !== user.username ||
    workHoursPerDay !== user.workHoursPerDay
  
  return ( 
    <div>
      <Form onSubmit={ handleSubmit }>

        <PageContentHeaderComponent title="My profile settings">
          { dirty && (
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          ) }
        </PageContentHeaderComponent>

        <PageContentBodyComponent>
          <Form.Group controlId="formBasicRangeCustom">
            <Form.Label>
              Preferred work hours per day: { workHoursPerDayVisual }
            </Form.Label>
            <Form.Control
              onChange={ e => setWorkHoursPerDay( parseFloat( e.target.value ) ) } 
              value={ workHoursPerDay }
              type="range" 
              min=".5" 
              max="20"
              step=".5" 
              custom />
          </Form.Group>
          <Form.Group controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control 
              type="text" 
              value={ username }
              onChange={ e => setUsername( e.target.value ) }
              placeholder="Enter username" />
          </Form.Group>
          
          <LogoutButton />
        </PageContentBodyComponent>
        
      </Form>
    </div>
  )
}
export default MyUserPage