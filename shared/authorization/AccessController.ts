import { UserRole } from '../interfaces/UserRole';

type UserLike = {id:string,role:UserRole}

export default class AccessController {
  // // // // unused for now
  // public checkPermissions( user:UserLike, options:{ minimumRole?:UserRole, userId?:string } )
  // {
  //   if ( options.userId && user.id === options.userId ) 
  //     return true
  //   if ( options.minimumRole && user.role >= options.minimumRole ) 
  //     return true
  //   return false
  // }

  public canViewOwnUser = ( user:UserLike ) => !! user
  public canViewOwnEntries = ( user:UserLike ) => user.role >= UserRole.Member
  public canViewAllUsers = ( user:UserLike ) => user.role >= UserRole.UserManager
  public canViewAllEntries = ( user:UserLike ) => user.role >= UserRole.Admin

  public canEditOwnEntries = ( user:UserLike ) => !! user
  public canEditAllEntries = ( user:UserLike ) => user.role >= UserRole.Admin

  public can( user:UserLike ) {
    return {
      create: {
        own: {
          user: () => true,
          entry: () => !! user,
        },
        any: {
          user: () => user.role >= UserRole.UserManager,
          entry: () => user.role >= UserRole.Admin,
        },
      },
      read: {
        own: {
          user: () => !! user,
          entry: () => user.role >= UserRole.Member,
        },
        any: {
          user: () => user.role >= UserRole.UserManager,
          entry: () => user.role >= UserRole.Admin,
        },
      },
      update: {
        own: {
          user: () => !! user,
          entry: () => user.role >= UserRole.Member,
        },
        any: {
          user: () => user.role >= UserRole.UserManager,
          entry: () => user.role >= UserRole.Admin,
        },
      },
      delete: {
        own: {
          user: () => !! user,
          entry: () => user.role >= UserRole.Member,
        },
        any: {
          user: () => user.role >= UserRole.UserManager,
          entry: () => user.role >= UserRole.Admin,
        },
      },
    }
  }
}