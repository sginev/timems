import React from 'react';

export interface User
{
  id : string
  username : string
  preferredWorkingHoursPerDay? : number
  role : UserRole
}

export enum UserRole {
  Admin       = 30, /// CRUD everything
  UserManager = 20, /// CRUD users, R entries
  Member      = 10, /// CRUD own entries, R users, R entries
  Locked      = 0, /// nada
}

// export const PermissionsResolver = {
  // canEditEntry
// }

export const MyUserContext = React.createContext<User|null>( null );