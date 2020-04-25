import express from 'express';

import users from './users.route';
import entries from './entries.route';
import ApiError from '../types/ApiError';
import { handleRouteAuth, processAccessToken, handleRouteGetAuthenticatedUserData } from './auth.route';

const routes = express.Router();

//// Authentication (before processing access token)

routes.post( ['/register','/login'], handleRouteAuth );

//// Process caller's access token

routes.use( processAccessToken )

//// Return user data for returning user (via their access token)

routes.get( '/me', handleRouteGetAuthenticatedUserData );

//// CRUD user documents

routes.use( "/users", users );

//// CRUD work entry documents

routes.use( "/entries", entries );

//// 404

routes.use( (_, res) => {
  if ( ! res.locals.data )
    throw new ApiError( "Invalid route.", 404 )
  res.json( {
    status : "success",
    data : res.locals.data || undefined
  } ) 
} );

//// Handle errors (still respond with valid json, containing the error message)

routes.use( async ( error:ApiError, req, res, next ) => {
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  const name = error.name || 'Unknown Error';
  // const stacktrace = error.stack?.split('\n').slice(1).map(ln=>ln.trim()) 
  console.log( `\x1b[31m${ status >= 500 ? error.stack : [name,message] }\x1b[0m` )
  res.status( status ).send({ error: { name, message, status } });
} );

////

export default routes;