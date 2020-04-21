// import hooks from './hooks'

export default {
  id : '_',
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
  },
  update( userData:any ) {
    this.id = userData.id
    this.username = userData.username
    this.role = userData.role
    this.workHoursPerDay = userData.workHoursPerDay
  }
}