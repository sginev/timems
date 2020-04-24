
// const API_URL_ORIGIN = window.location.origin
const API_URL_ORIGIN = 'http://thechoephix.com:3000'
const API_URL_PATH = "/api"

const KEY_ACCESS_TOKEN = "ACCESS_TOKEN";

const api = new class ApiService
{
  baseUrl:string = API_URL_ORIGIN + API_URL_PATH
  authToken:string|null = localStorage.getItem( KEY_ACCESS_TOKEN )

  async request<T extends any>( path:string, method:"get"|"post"|"patch"|"put"|"delete", data?:any ) {
    const headers = { "Content-Type" : "application/json" }
    this.authToken && ( headers["Authorization"] = "Bearer " + this.authToken )

    let body:any = undefined
    if ( method === "get" ) {
      if ( data ) {
        path += '?' + Object.entries( data )
          .filter(([_, value]) => value !== undefined )
          .map(([key, val]) => `${key}=${val}`)
          .join('&');
      }
    } else {
      body = JSON.stringify( data )
    }

    const response = await fetch( this.baseUrl + path, { method, headers, body } );
    
    if ( response.status > 299 ) {
      console.error( response.statusText )
      const json = await response.json();
      if ( json.error ) {
        throw json.error
      } else {
        throw new Error( "API Error: " + response.statusText )
      }
    }

    const json = await response.json();
    return json.data as T;
  }

  async getEntries() {
    const data = await this.request<{entries:any[]}>( "/entries", "get" )
    return data.entries
  }
  async getUsers() {
    const data = await this.request<{users:any[]}>( "/users", "get" )
    return data.users
  }
} ()

export default api