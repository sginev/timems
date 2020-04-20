// import hooks from './hooks'

export default {
  id : '61f0c617-1a02-407b-af5a-7052ccd7d13f',
  role : 9,
  username : 'memberado',
  workHoursPerDay : 10,
  canViewPage( page:"my-entries"|"all-entries"|"all-users"|"my-user" ) {
    switch ( page ) {
      case "my-entries": return this.role >= 1
      case "all-users": return this.role >= 5
      case "all-entries": return this.role >= 9
      case "my-user": return this.role >= 1
      default: return false
    }
  }
}