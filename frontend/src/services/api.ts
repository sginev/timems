import hooks from '../utils/hooks'

import { API_HOST, LOCAL_STORAGE_KEY_ACCESS_TOKEN } from '../Configuration'

class ApiService
{
  baseUrl:string = API_HOST
  authToken:string|null = localStorage.getItem( LOCAL_STORAGE_KEY_ACCESS_TOKEN )

  get isLoggedIn() { return !! this.authToken }

  public readonly login = async ( username:string, password:string ) => {
    return await this.authenticate( '/login', { username, password } )
  }

  public readonly register = async ( username:string, password:string ) => {
    return await this.authenticate( '/register', { username, password } )
  }

  public readonly logout = async () => {
    this.setAuthToken( null );
    hooks.setMyUserData( null );
  }

  private async authenticate ( path:string, data:{ username:string, password:string } ) {
    const results = await this.request( path, "post", data );
  
    if ( ! results.accessToken ) {
      throw new Error( "Authorization failed." );
    }
  
    if ( ! results.user ) {
      throw new Error( "Server failed to send user data." );
    }
    
    this.setAuthToken( results.accessToken );
    hooks.setMyUserData( results.user );
  }

  async request<T extends any>( path:string, method:"get"|"post"|"patch"|"put"|"delete", data?:any ) {
    const headers = { "Content-Type" : "application/json" }
    this.authToken && ( headers["Authorization"] = "Bearer " + this.authToken );

    let body:any = undefined;
    if ( method === "get" ) {
      if ( data ) {
        path += '?' + Object.entries( data )
          .filter(([_, value]) => value !== undefined )
          .map(([key, val]) => `${key}=${val}`)
          .join('&');
      }
    } else {
      body = JSON.stringify( data );
    }

    const response = await fetch( this.baseUrl + path, { method, headers, body } );
    
    if ( response.status > 299 ) {
      console.error( response.statusText );
      const json = await response.json();
      if ( json.error ) {
        throw json.error;
      } else {
        throw new Error( "API Error: " + response.statusText );
      }
    }

    const json = await response.json();
    return json.data as T;
  }
  
  private setAuthToken( value:string|null ) {
    this.authToken = value || null;
    value ?
      localStorage.setItem( LOCAL_STORAGE_KEY_ACCESS_TOKEN, value ) :
      localStorage.removeItem( LOCAL_STORAGE_KEY_ACCESS_TOKEN )
  }
}

export default new ApiService()