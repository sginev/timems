export default class ApiError extends Error {
  constructor( message:string, public readonly status?:number, name:string="ApiError" ) {
    super( message );
    super.name = name
  }
}

export const handleError = async ( error:ApiError, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  const name = error.name || 'Unknown Error';
  // const stacktrace = error.stack?.split('\n').slice(1).map(ln=>ln.trim()) 
  console.log( `\x1b[31m${ status >= 500 ? error.stack : [name,message] }\x1b[0m` )
  res.status( status ).send({ error: { name, message } });
}