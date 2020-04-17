export interface DataObject
{
  id : string
}

export interface User extends DataObject
{
  username : string
  passhash : string
  settings : {
    preferredWorkingHoursPerDay? : number
  }
  role : UserRole
}

export enum UserRole {
  Admin,        /// CRUD everything
  UserManager,  /// CRUD users, R entries
  Member,       /// CRUD own entries, R users, R entries
  Guest,        /// R users, R entries
}

export interface Entry extends DataObject
{
  userId : string
  date : number
  duration : number
  notes : string[]
}