import { API_HOST, LOCAL_STORAGE_KEY_ACCESS_TOKEN } from '../Configuration'

const api = new class ApiService
{
  baseUrl:string = API_HOST
  authToken:string|null = localStorage.getItem( LOCAL_STORAGE_KEY_ACCESS_TOKEN )

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
} ()

export default api