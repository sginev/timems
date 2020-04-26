import Express from 'express';
import ApiError from '../types/ApiError';
import { UserRole } from 'shared/interfaces/UserRole';
import { authenticateUser, validateToken } from '../util/auth';

import data from '../datamanager';
import { AccessControl } from 'shared/authorization/AccessControl';
import validation from 'shared/validation/Validator';
import { assertValidated } from '../util/assertions';

type Handler = ( req:Express.Request, res:Express.Response, next:Express.NextFunction ) => void;

export const handleRouteAuth:Handler = async (req, res, next) => 
{
  assertValidated( validation.api.auth.validate( req.body ) );
  
  const { username, password } = req.body;

  switch( req.path )
  {
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
}

export const processAccessToken:Handler = async (req, res, next) => 
{
  if ( ! res.locals.skipAuthorization ) 
  {
    const id = validateToken( req.headers['authorization'] ).userId;
    const user = ( await data.users.getById( id ) )?.toJSON();
    if ( ! user ) 
      throw new ApiError( "Your user does not exist. Please login again with a valid user.", 401 );
    res.locals.caller = user;
    res.locals.access = new AccessControl( user );
  }

  next();
}

export const handleRouteGetAuthenticatedUserData:Handler = async (_, res, next) => 
{
  res.locals.data = { user : res.locals.caller };
  next();
}