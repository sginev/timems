import React from 'react'

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import { UserRole } from 'shared/interfaces/UserRole';
import { User, MyUserContext } from '../services/user';

import api from "../services/api"

export default function UserListComponent( props:{ list:User[], onChange:()=>void } ) {
  return (
    <div className="user-list">
      { props.list.map( o => <UserListItemComponent key={ o.id } user={ o } onChange={ props.onChange } /> ) }
    </div>
  )
}

const UserListItemComponent:React.FC<{user:User,onChange:()=>void}> = ({ user, onChange }) => {
  const myUser = React.useContext( MyUserContext ) as User;
  const [ role, setRole ] = React.useState( user.role ); 
  const ROLES = {
    [UserRole.Member] : { label : "Regular User", color : "primary" } ,
    [UserRole.UserManager] : { label : "User Manager", color : "warning" } ,
    [UserRole.Admin] : { label : "Administrator", color : "danger" } ,
    [UserRole.Locked] : { label : "Locked", color : "secondary" } ,
  };
  const TEXT = ! user.preferredWorkingHoursPerDay ? <>&#8203;</> :
    "Preferred work hours per day: " + user.preferredWorkingHoursPerDay;
  const canChangeRole = myUser.id !== user.id 
                      && myUser.role >= user.role 
                       && myUser.role >= 5;

  const deleteUser = () => {
    if ( window.confirm( "Are your sure you wnat to remove ths user? This is irreversible." ) ) {
      const confirmInput = window.prompt( `Please enter their username to proceed with deletion (${ user.username })` )
      if ( confirmInput === user.username ) {
        api.request( '/users/' + user.id, 'delete' )
          .then( onChange )
      }
    }
  }                       

  const changeUserRole = ( role:UserRole ) => {
    setRole( -1 )
    api.request( '/users/' + user.id, 'post', { role } )
      .then( () => setRole( role ) )
      .catch( () => setRole( user.role ) )
  }                       

  const renderDeleteButton = () => {
    return (
      <Button 
        id="user-delete" 
        variant='outline-danger' 
        disabled={ ! canChangeRole }
        onClick={ deleteUser }>
        Delete User
      </Button>
    )
  }

  const renderRoleDropdown = () => {
    if ( role == -1 )
      return <Button id="dropdown-basic-button" variant='link' disabled>Please wait...</Button>
    if ( ! ROLES[ role ] )
      return <Button id="dropdown-basic-button" variant='dark' disabled>Error getting roles</Button>
    return (
      <DropdownButton
          disabled={ ! canChangeRole }
          title={ ROLES[ role ].label }
          variant={ ROLES[ role ].color }
          id="dropdown-basic-button" >
        { 
          Object.keys( ROLES )
                .filter( key => myUser.role >= parseInt( key ) )
                .map( key => (
                  <Dropdown.Item key={ key } onClick={ () => changeUserRole( parseInt( key ) ) }>
                    { ROLES[ key ].label } 
                  </Dropdown.Item>
                ) )
        }
      </DropdownButton>
    )
  }
  return (
    <Card style={{ width: '18rem' }} className="user-list-item">
      {/* <Card.Img variant="top" src={ img } /> */}
      <Card.Body>
        <Card.Title>{ user.username }</Card.Title>
        <Card.Text> { TEXT } </Card.Text>
        <ButtonGroup className="mr-2" size="sm">
          { renderRoleDropdown() }
          { renderDeleteButton() }
        </ButtonGroup>
      </Card.Body>
    </Card>
  )
}