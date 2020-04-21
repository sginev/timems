import express from 'express';

import data from './datamanager';
import config from './configuration';
import ApiError, { handleError } from './api-errors';
import { authenticateUser, validateToken } from './util/auth';
import { UserRole, User } from './models';


const routes = express.Router();
const validation = new class 
{
  //// throws error if ALL check options fail
  async checkPermissions( user:User, options:{ minimumRole?:UserRole, userId?:string } ) {
    if ( options.userId && user.id === options.userId ) 
      return
    if ( options.minimumRole && user.role >= options.minimumRole ) 
      return
    throw new ApiError( "Access denied.", 403 );
  }
}();



//// AUTHENTICATION ////

routes.post( '/register', async (req, res, next) => {
  const { username, password } = req.body;
  if ( ! username ) throw new ApiError( "No username given" )
  if ( ! password ) throw new ApiError( "No password given" )
  const user = await data.addUser( username, password, UserRole.Member );
  const { accessToken, refreshToken } = authenticateUser( user );
  res.status(201)
  res.locals.data = { user, accessToken, refreshToken };
  res.locals.skipAuthorization = true;
  next();
} );

routes.post( '/login', async (req, res, next) => {
  const { username, password } = req.body;
  if ( ! username ) throw new ApiError( "No username given" )
  if ( ! password ) throw new ApiError( "No password given" )
  const user = await data.checkUserCredentials( username, password );
  const { accessToken, refreshToken } = authenticateUser( user );
  res.status(201)
  res.locals.data = { user, accessToken, refreshToken };
  res.locals.skipAuthorization = true;
  next();
} );

//// PREDEFINE LOCALS

routes.use( async (req, res, next) => {
  if ( ! res.locals.skipAuthorization ) {
    // const user = await data.getUserByUsername( `admin` )
    const id = validateToken( req.headers['authorization'] ).userId;
    const user = await data.getUserById( id );
    if ( ! user ) 
      throw new ApiError( "Your user does not exist. Please login again with a valid user.", 401 );
    res.locals.caller = user;
  }
  next();
} )

routes.param( 'userId', async (_, res, next, userId) => {
  res.locals.user = await data.getUserById( userId );
  next()
} );

routes.param( 'entryId', async (_, res, next, entryId) => {
  res.locals.entry = await data.getEntryById( entryId );
  next()
} );

//// USERS ////

routes.get( '/me', async (_, res, next) => {
  res.locals.data = { user : res.locals.caller };
  next();
} );

routes.get( '/users', async (_, res, next) => {
  const minimumRole = UserRole.UserManager;
  await validation.checkPermissions( res.locals.caller, { minimumRole } );

  const users = await data.getUsers()

  res.locals.data = {
    users: users.map( user => ({ ...user, passhash : undefined }) )
  };
  next();
} );

routes.get( '/users/:userId', async (req, res, next) => {
  const userId = req.params.userId;
  
  const minimumRole = UserRole.UserManager;
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId } );
  
  const user = res.locals.user

  if ( !user ) 
    throw new ApiError( `User not found.`, 404 );

  res.locals.data = { user : { ...user, passhash : undefined } }
  next();
} );

routes.put('/users', async (req, res, next) => {
  const { username, password, role } = req.body;

  const minimumRole = UserRole.UserManager;
  await validation.checkPermissions( res.locals.caller, { minimumRole } );
  
  if ( res.locals.caller.role < role )
    throw new ApiError( "You cannot create users with higher permission level than your own." );

  const user = await data.addUser( username, password, role || UserRole.Member );
  
  res.locals.data = { user : { ...user, passhash : undefined } }
  next();
});

routes.patch('/users/:userId', async (req, res, next) => {
  interface UserData { username:string, password:string, role:number };
  const userId = req.params.userId;
  const updates:UserData = req.body;

  const minimumRole = UserRole.UserManager;
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId } );
  if ( updates.role && res.locals.caller.role < updates.role )
    throw new ApiError( "You cannot set users to a higher permission level than your own." );

  let user = res.locals.user
  if ( !user ) 
    throw new ApiError( `User not found.`, 404 );
  user = await data.updateUser( userId, updates )

  res.locals.data = { user : { ...user, passhash : undefined } }
  next();
});

routes.delete('/users/:userId', async (req, res, next) => {
  const userId = req.params.userId;
  
  const minimumRole = UserRole.UserManager;
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId } );

  const user = res.locals.user
  if ( !user ) throw new ApiError( `User not found.`, 404 );
  
  await data.deleteUser( userId );
  
  res.locals.data = {};
  next();
});

//// USER ENTRIES ////

routes.get( '/users/:userId/entries', async (req, res, next) => {
  const userId = req.params.userId;
  
  const minimumRole = UserRole.Admin;
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId } );
  
  const user = res.locals.user
  if ( !user ) throw new ApiError( `User not found.`, 404 );

  const entries = await data.getUserEntries( userId );

  res.locals.data = { entries };
  next();
} );

//// ENTRIES ////

routes.get( '/entries', async (_, res, next) => {
  const minimumRole = UserRole.Admin;
  await validation.checkPermissions( res.locals.caller, { minimumRole } );
  
  res.locals.data = {
    entries : await data.getEntries()
  }
  next();
} );

routes.put('/entries', async (req, res, next) => {
  const { userId, day, duration, notes } = req.body;
  
  const minimumRole = UserRole.Admin;
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId } );

  res.locals.data = {
    entries : await data.addEntry( userId, day, duration, notes )
  };
  next();
});

routes.get( '/entries/:entryId', async (_, res, next) => {
  const minimumRole = UserRole.Admin;
  const entry = res.locals.entry
  if ( !entry ) throw new ApiError( `Entry not found.`, 404 );

  await validation.checkPermissions( res.locals.caller, { minimumRole, userId : entry.userId } );

  res.locals.data = { entry };
  next();
} );

routes.patch('/entries/:entryId', async (req, res, next) => {
  interface EntryData { day:number , duration:number , notes:string[] };
  const updates:EntryData = req.body;
  const entryId = req.params.entryId;

  const minimumRole = UserRole.Admin;
  
  let entry = res.locals.entry
  if ( !entry ) 
    throw new ApiError( `Entry not found.`, 404 );
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId : entry.userId } );
  entry = await data.updateEntry( entryId, updates ) 
  
  res.locals.data = { entry };
  next();
});

routes.delete('/entries/:entryId', async (_, res, next) => {
  const minimumRole = UserRole.Admin;
  const entry = res.locals.entry
  if ( !entry ) throw new ApiError( `Entry not found.`, 404 );
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId : entry.userId } );
  await data.deleteEntry( entry.id )

  res.locals.data = {};
  next();
});





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