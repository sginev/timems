import { UserRole } from "shared/UserRole";
import { IUser } from "../models/User";
import ApiError from "../api-errors";

//// throws error if ALL check options fail
export async function checkPermissions( user:IUser, options:{ minimumRole?:UserRole, userId?:string } ) {
  if ( options.userId && user.id === options.userId ) 
    return
  if ( options.minimumRole && user.role >= options.minimumRole ) 
    return
  throw new ApiError( "Access denied.", 403 );
}