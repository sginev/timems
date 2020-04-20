// import hooks from './hooks'

import json from "./temp/database.json"

export default {
  getEntries() {
    return json.entries
  },
  getUsers() {
    return json.users
  },
}