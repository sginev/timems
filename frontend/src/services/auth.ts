import api from './api'
import hooks from './hooks'

const KEY_ACCESS_TOKEN = "ACCESS_TOKEN";

const fakeAuthenticationService = {
  isLoggedIn() {
    return !! localStorage.getItem( KEY_ACCESS_TOKEN )
  },

  async login( username:string, password:string ) {
    const results = await api.request( "/login", "post", { username, password } )

    if ( ! results.accessToken ) {
      throw new Error( "Authorization failed." )
    }

    if ( ! results.user ) {
      throw new Error( "Server failed to send user data." )
    }

    api.authToken = results.accessToken
    localStorage.setItem( KEY_ACCESS_TOKEN, results.accessToken )

    hooks.setMyUserData( results.user )
  },

  async logout() {
    api.authToken = null
    localStorage.removeItem( KEY_ACCESS_TOKEN )

    hooks.setMyUserData( null ) 
  }
}

export default fakeAuthenticationService