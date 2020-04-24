import React from 'react';

export interface User
{
  id : string
  username : string
  passhash : string
  preferredWorkingHoursPerDay? : number
  role : UserRole
}

export enum UserRole {
  Admin       = 9, /// CRUD everything
  UserManager = 6, /// CRUD users, R entries
  Member      = 2, /// CRUD own entries, R users, R entries
  Guest       = 1, /// R users, R entries
  Locked      = 0, /// nada
}

// export const PermissionsResolver = {
  // canEditEntry
// }

export const MyUserContext = React.createContext<User|null>( null );