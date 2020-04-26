import React, { useState } from 'react'
import { useHistory } from "react-router-dom";
import { useToasts } from 'react-toast-notifications';

import api from "../../services/api"
import hooks from '../../services/hooks'
import authenticationService from '../../services/auth'
import { MyUserContext, User } from '../../services/user';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import UserRoleStyling from '../../styling/UserRoles'

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';

function LogoutButton() {
  let history = useHistory();
  return (
    <p className="link" 
      onClick={() => authenticationService.logout().then( () => history.push("/login") ) }>
      Log out of your account
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
  const [ preferredWorkingHoursPerDay, setWorkHoursPerDay ] = useState( myUser.preferredWorkingHoursPerDay )
  const [ username, setUsername ] = useState( myUser.username )
  const { addToast } = useToasts();

  const dirty = ! weakCompareObjects( { username, preferredWorkingHoursPerDay }, myUser )

  const workHoursPerDayVisual = ( ! preferredWorkingHoursPerDay ) ? 'Disabled' : (
    ( ~~preferredWorkingHoursPerDay ) + " hours" + 
    ( 
      preferredWorkingHoursPerDay % 1.0 === 0.0 ? '' :
      ( ' ' + ( preferredWorkingHoursPerDay % 1.0 ) * 60 + ' minutes' ) 
    ) + ( preferredWorkingHoursPerDay >= 16 ? ' (Get some sleep!)' : '' )
  )
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.request( '/users/' + myUser.id, "post", { username, preferredWorkingHoursPerDay } );
      hooks.setMyUserData( { ...myUser, username, preferredWorkingHoursPerDay } );
      addToast( 'Profile updated.', { appearance : "success" } )
    } catch ( e ) {
      addToast( e.message, { appearance : "error" } )
    }
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
          <div style={{ maxWidth:"520px" }}>

            <Form.Group controlId="formBasicRole">
              <Form.Label>Your permission level is:</Form.Label>
              <h4>{ UserRoleStyling.get( myUser.role ).label }</h4>
            </Form.Group>

            <br/>

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
                Preferred work hours per day: <b>{ workHoursPerDayVisual }</b>
              </Form.Label>
              <Form.Control
                onChange={ e => 
                  setWorkHoursPerDay( parseFloat( e.target.value ) || undefined ) } 
                value={ preferredWorkingHoursPerDay || 0 }
                type="range" 
                min="0" 
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