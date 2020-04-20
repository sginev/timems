
// const API_URL_ORIGIN = window.location.origin
const API_URL_ORIGIN = 'http://thechoephix.com:3000'
const API_URL_PATH = "/api"

const api = new class ApiService
{
  baseUrl:string = API_URL_ORIGIN + API_URL_PATH
  authToken?:string

  async request<T extends any>( path:string, method:"get"|"post"|"patch"|"put"|"delete", body?:any ) {
    const authToken = this.authToken
    const headers = authToken ? { "Authorization" : "Bearer " + authToken } : undefined
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