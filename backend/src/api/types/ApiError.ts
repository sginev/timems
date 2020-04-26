export default class ApiError extends Error {
  constructor( message:string, public readonly status?:number, name:string="ApiError" ) {
    super( message );
    super.name = name
  }
}