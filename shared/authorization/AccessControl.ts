import { UserRole } from '../interfaces/UserRole';

type UserLike = {id?:string,role:UserRole}

export class AccessControl {
  constructor ( private readonly user:UserLike ) {}

  public readonly create = {
    own: {
      entry: !! this.user,
    },
    any: {
      user: this.user.role >= UserRole.UserManager,
      entry: this.user.role >= UserRole.Admin,
    },
  }

  public readonly read = {
    own: {
      user: !! this.user,
      entry: this.user.role >= UserRole.Member,
    },
    any: {
      user: this.user.role >= UserRole.UserManager,
      entry: this.user.role >= UserRole.Admin,
    },
  }

  public readonly update = {
    own: {
      user: !! this.user,
      entry: this.user.role >= UserRole.Member,
    },
    any: {
      user: this.user.role >= UserRole.UserManager,
      entry: this.user.role >= UserRole.Admin,
    },
  }

  public readonly delete = {
    own: {
      user: !! this.user,
      entry: this.user.role >= UserRole.Member,
    },
    any: {
      user: this.user.role >= UserRole.UserManager,
      entry: this.user.role >= UserRole.Admin,
    },
  }
}