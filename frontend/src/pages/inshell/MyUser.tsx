import React, { useState } from 'react'
import { useHistory, Link } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import hooks from '../../services/hooks'
import authenticationService from '../../services/auth'
import { MyUserContext, User } from '../../services/user';

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';

function LogoutButton() {
  let history = useHistory();
  return (
    <p className="link" 
      onClick={() => authenticationService.logout().then( () => history.push("/login") ) }>
      Log out of this account
    </p>
  )
}

function weakCompareObjects( a:any, b:any ) {
  for ( const key in a )
    if ( a[key] !== b[ key ] )
      return false
  return true
}

function MyUserPage() {
  const myUser = React.useContext( MyUserContext ) as User;
  const [ preferredWorkingHoursPerDay, setWorkHoursPerDay ] = useState( myUser.preferredWorkingHoursPerDay || 4 )
  const [ username, setUsername ] = useState( myUser.username )

  const dirty = ! weakCompareObjects( { username, preferredWorkingHoursPerDay }, myUser )

  const workHoursPerDayVisual = (
    ( ~~preferredWorkingHoursPerDay ) + " hours" + 
    ( 
      preferredWorkingHoursPerDay % 1.0 === 0.0 ? '' :
      ( ' ' + ( preferredWorkingHoursPerDay % 1.0 ) * 60 + ' minutes' ) 
    )
  )
  const handleSubmit = async e => {
    e.preventDefault()
    hooks.setMyUserData( { ...myUser, username, preferredWorkingHoursPerDay } )
  }
  
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
          <div style={{ maxWidth:"400px" }}>

          <Form.Group controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                value={ username }
                onChange={ e => setUsername( e.target.value ) }
                placeholder="Enter username" />
            </Form.Group>

            <br/>
            
            <Form.Group controlId="formBasicRangeCustom">
              <Form.Label>
                Preferred work hours per day: { workHoursPerDayVisual }
              </Form.Label>
              <Form.Control
                onChange={ e => setWorkHoursPerDay( parseFloat( e.target.value ) ) } 
                value={ preferredWorkingHoursPerDay }
                type="range" 
                min=".5" 
                max="20"
                step=".5" 
                custom />
            </Form.Group>

            <br/>
            <br/>
            <br/>
            
            <LogoutButton />

          </div>
        </PageContentBodyComponent>
        
      </Form>
    </div>
  )
}
export default MyUserPage