import React from 'react'

import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import UserRoleStyling, { AllRoles } from '../styling/UserRoles'

import { UserRole } from 'shared/interfaces/UserRole';
import { User, MyUserContext } from '../utils/user';

import api from "../services/api"

export default function UserListComponent( props:{ list:User[], onChange:()=>void } ) {
  return (
    <div className="user-list">
      <div className="user-list-item user-list-header">
        <div className="username"> Account </div>
        <div className="text"> Notes </div>
        <div className="button button-role"> &#8203; </div>
        <div className="button button-delete"> &#8203; </div>
      </div>
      { props.list.map( o => <UserListItemComponent key={ o.id } user={ o } onChange={ props.onChange } /> ) }
    </div>
  )
}

// type ColorVariant = "primary" | "warning" | "danger" | "secondary" | "dark" | "success" | "info" | "light" | undefined

// const UserListItemEmptyComponent = () => (
//   <div className={`user-list-item`}>
//     <div className={"username"}> &#8203; </div>
//     <div className="text"> &#8203; </div>
//     <div className="button button-role"> &#8203; </div>
//     <div className="button button-delete"> &#8203; </div>
//   </div>
// )

const UserListItemComponent:React.FC<{user:User,onChange:()=>void}> = ({ user, onChange }) => {
  const myUser = React.useContext( MyUserContext ) as User;
  const [ role, setRole ] = React.useState( user.role ); 
  
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
      <Button block
        id="user-delete" 
        variant='outline-danger' 
        disabled={ ! canChangeRole }
        onClick={ deleteUser }>
        Delete User
      </Button>
    )
  }
  const roleProps = UserRoleStyling.get( role )

  const renderRoleDropdown = () => {
    if ( role === -1 )
      return <Button id="dropdown-basic-button" variant='link' disabled>Please wait...</Button>
    return (
      <DropdownButton
          disabled={ ! canChangeRole }
          title={ roleProps.label }
          id="dropdown-basic-button" >
        { 
          Object.entries( AllRoles )
                .filter( ([key,_]) => myUser.role >= parseInt( key ) )
                .map( ([key,props]) => (
                  <Dropdown.Item key={ key } onClick={ () => changeUserRole( parseInt( key ) ) }>
                    { props.label } 
                  </Dropdown.Item>
                ) )
        }
      </DropdownButton>
    )
  }

  return (
    <div className={`user-list-item`}>
      <div className={"username"}> { user.username }</div>
      <div className="text"> { TEXT }</div>
      <div className="button button-role"> { renderRoleDropdown() }</div>
      <div className="button button-delete"> { renderDeleteButton() }</div>
    </div>
  )
}