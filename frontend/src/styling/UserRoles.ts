import { UserRole } from 'shared/interfaces/UserRole';

export const AllRoles = {
  [UserRole.Member] : { label : "Regular", color : "secondary" } ,
  [UserRole.UserManager] : { label : "User Manager", color : "info" } ,
  [UserRole.Admin] : { label : "Administrator", color : "primary" } ,
  [UserRole.Locked] : { label : "Locked", color : "dark" } ,
};

export default {
  get( role:UserRole ) {
    return AllRoles[role] || { label : "Unknown", color : "dark" };
  }
};