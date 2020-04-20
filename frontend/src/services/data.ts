// import hooks from './hooks'

import json from "./temp/database.json"

export default new class {
  async getEntries() {
    await new Promise( re => setTimeout( re, 500 ) )
    return json.entries
  }
  async getUsers() {
    await new Promise( re => setTimeout( re, 500 ) )
    return json.users
  }
} ()
