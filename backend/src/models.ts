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
  Admin       = 9, /// CRUD everything
  UserManager = 5, /// CRUD users, R entries
  Member      = 2, /// CRUD own entries, R users, R entries
  Guest       = 1, /// R users, R entries
}

export interface Entry extends DataObject
{
  userId : string
  day : number
  duration : number
  notes : string[]
}