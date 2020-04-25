export enum UserRole {
  Admin       = 30, /// CRUD everything
  UserManager = 20, /// CRUD users, R entries
  Member      = 10, /// CRUD own entries, R users, R entries
  Locked      = 0, /// nada
}