import React from 'react';

import { UserRole } from 'shared/interfaces/UserRole';
import AccessController from 'shared/authorization/AccessController';

export interface User
{
  id : string
  username : string
  preferredWorkingHoursPerDay? : number
  role : UserRole
}

export const MyUserContext = React.createContext<User|null>( null );

export const AccessControlContext = React.createContext( new AccessController() );