import express from 'express';

import data from './datamanager';
import ApiError, { handleError } from './api-errors';
import { authenticateUser, validateToken } from './util/auth';

import users from './routes/users.route';
import entries from './routes/entries.route';
import { UserRole } from 'shared/interfaces/UserRole';

const routes = express.Router();

//// AUTHENTICATION ////

routes.post( ['/register','/login'], async (req, res, next) => {

  const { username, password } = req.body;
  if ( ! username ) throw new ApiError( "No username given" )
  if ( ! password ) throw new ApiError( "No password given" )

  switch( req.path ) {
    case '/register':
      var user = await data.users.add( username, password, UserRole.Member );
      break;
    case '/login':
      var user = await data.users.checkCredentials( username, password );
      break;
    default: 
      throw new ApiError( 'Bad path', 404 );
  }

  const { accessToken, refreshToken } = authenticateUser( user );
  res.status(201)
  res.locals.data = { user, accessToken, refreshToken };
  res.locals.skipAuthorization = true;

  next();
} );

routes.use( async (req, res, next) => {
  if ( ! res.locals.skipAuthorization ) {
    // const user = await data.getUserByUsername( `admin` )
    const id = validateToken( req.headers['authorization'] ).userId;
    const user = ( await data.users.getById( id ) )?.toJSON();
    if ( ! user ) 
      throw new ApiError( "Your user does not exist. Please login again with a valid user.", 401 );
    res.locals.caller = user;
  }
  next();
} )

////

routes.get( '/me', async (_, res, next) => {
  res.locals.data = { user : res.locals.caller };
  next();
} );

routes.use( "/users", users );
routes.use( "/entries", entries );

routes.use( (_, res) => {
  if ( ! res.locals.data )
    throw new ApiError( "Invalid route.", 404 )
  res.json( {
    status : "success",
    data : res.locals.data || undefined
  } ) 
} );

routes.use( handleError );

export default routes;