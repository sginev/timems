import React, { useState, useContext } from 'react'

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import { User, MyUserContext } from '../services/user'

export default function UserListComponent( props:{ list:User[] } ) {
  return (
    <div className="user-list">
      { props.list.map( o => <UserListItemComponent key={ o.id } user={ o } /> ) }
    </div>
  )
}

const img = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22286%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20286%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_17197fb20c3%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_17197fb20c3%22%3E%3Crect%20width%3D%22286%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22107.1953125%22%20y%3D%2296.3%22%3E286x180%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E"

const UserListItemComponent:React.FC<{user:User}> = ({ user }) => {
  const myUser = React.useContext( MyUserContext ) as User;
  const [ role, setRole ] = useState( user.role );
  const ROLES = {
    2 : { label : "Regular User", color : "primary" } ,
    6 : { label : "User Manager", color : "warning" } ,
    9 : { label : "Administrator", color : "danger" } ,
    0 : { label : "Locked", color : "secondary" } ,
  };
  const TEXT = ! user.preferredWorkingHoursPerDay ? '-' :
    "Preferred work hours per day: " + user.preferredWorkingHoursPerDay;
  const canChangeRole = myUser.id !== user.id 
                      && myUser.role >= user.role 
                       && myUser.role >= 5;
  return (
    <Card style={{ width: '18rem' }} className="user-list-item">
      {/* <Card.Img variant="top" src={ img } /> */}
      <Card.Body>
        <Card.Title>{ user.username }</Card.Title>
        <Card.Text> { TEXT } </Card.Text>
        <DropdownButton
            disabled={ ! canChangeRole }
            title={ ROLES[ role ].label }
            variant={ ROLES[ role ].color }
            id="dropdown-basic-button" 
            size="sm">
          { 
            Object.keys( ROLES )
                  .filter( key => myUser.role >= parseInt( key ) )
                  .map( key => (
                    <Dropdown.Item key={ key } onClick={ () => setRole( parseInt( key ) ) }>
                      { ROLES[ key ].label } 
                    </Dropdown.Item>
                  ) )
          }
        </DropdownButton>
      </Card.Body>
    </Card>
  )
}