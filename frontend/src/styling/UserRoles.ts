import { UserRole } from 'shared/interfaces/UserRole';

export const AllRoles = {
  [UserRole.Member] : { label : "Regular", color : "primary" } ,
  [UserRole.UserManager] : { label : "User Manager", color : "warning" } ,
  [UserRole.Admin] : { label : "Administrator", color : "danger" } ,
  [UserRole.Locked] : { label : "Locked", color : "secondary" } ,
};

export default {
  get( role:UserRole ) {
    return AllRoles[role] || { label : "Unknown", color : "dark" };
  }
};