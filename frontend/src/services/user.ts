import React from 'react';

import { UserRole } from 'shared/interfaces/UserRole';

export interface User
{
  id : string
  username : string
  preferredWorkingHoursPerDay? : number
  role : UserRole
}

// export const PermissionsResolver = {
  // canEditEntry
// }

export const MyUserContext = React.createContext<User|null>( null );