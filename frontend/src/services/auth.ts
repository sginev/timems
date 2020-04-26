import api from './api'
import hooks from '../utils/hooks'
import { LOCAL_STORAGE_KEY_ACCESS_TOKEN } from '../Configuration'

async function authenticate( path:string, data:{ username:string, password:string } ) {
  const results = await api.request( path, "post", data )

  if ( ! results.accessToken ) {
    throw new Error( "Authorization failed." )
  }

  if ( ! results.user ) {
    throw new Error( "Server failed to send user data." )
  }

  api.authToken = results.accessToken
  
  localStorage.setItem( LOCAL_STORAGE_KEY_ACCESS_TOKEN, results.accessToken )

  hooks.setMyUserData( results.user )
}

const authenticationService = new class AuthenticationService {
  isLoggedIn() {
    return !! localStorage.getItem( LOCAL_STORAGE_KEY_ACCESS_TOKEN )
  }

  async login( username:string, password:string ) {
    return await authenticate( '/login', { username, password } )
  }

  async register( username:string, password:string ) {
    return await authenticate( '/register', { username, password } )
  }

  async logout() {
    api.authToken = null

    localStorage.removeItem( LOCAL_STORAGE_KEY_ACCESS_TOKEN )

    hooks.setMyUserData( null ) 
  }
}()

export default authenticationService;