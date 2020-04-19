import express from 'express';
import data from './datamanager';
import ApiError, { handleError } from './api-errors';
import { authenticateUser, validateToken } from './util/auth';
import { UserRole, User } from './models';

const routes = express.Router();
const validation = new class 
{
  async getRequestingUser( req:express.Request ) {
    const id = validateToken( req.headers['authorization'] ).userId;
    const user = await data.getUserById( id );
    if ( ! user ) 
      throw new ApiError( "Your user does not exist. Please login again with a valid user.", 401 );
    return user;
  }
  
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

routes.post( '/register', async (req, res) => {
  const { username, password } = req.body;
  const user = await data.addUser( username, password, UserRole.Member );
  const { accessToken, refreshToken } = authenticateUser( user );
  res.status(201).send( { accessToken, refreshToken } );
} );

routes.post( '/login', async (req, res) => {
  console.log( req.path, res.locals )
  const { username, password } = req.body;
  const user = await data.checkUserCredentials( username, password );
  const { accessToken, refreshToken } = authenticateUser( user );
  console.log( req.path, res.locals.caller )
  res.status(201).send( { accessToken, refreshToken } );
} );

//// PREDEFINE LOCALS

routes.use( '/users', async (req, res, next) => {
  res.locals.caller = await validation.getRequestingUser( req );
  next()
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

routes.get( '/users', async (req, res) => {
  const minimumRole = UserRole.UserManager;
  await validation.checkPermissions( res.locals.caller, { minimumRole } );
  res.json( await data.getUsers() );
} );

routes.put('/users', async (req, res) => {
  const { username, password, role } = req.body;
  
  const minimumRole = UserRole.UserManager;
  if ( res.locals.caller.role < role )
    throw new ApiError( "You cannot create users with higher permission level than your own." );
  await validation.checkPermissions( res.locals.caller, { minimumRole } );

  const user = await data.addUser( username, password, role );
  res.json( user );
});

routes.get( '/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  const minimumRole = UserRole.UserManager;
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId } );
  
  const user = res.locals.user
  if ( !user ) throw new ApiError( `User not found.`, 404 );
  res.json( user );
} );

routes.patch('/users/:userId', async (req, res) => {
  interface UserData { username:string, password:string, role:number };
  const userId = req.params.userId;
  const updates:UserData = req.body;
    
  const minimumRole = UserRole.UserManager;
  if ( updates.role && res.locals.caller.role < updates.role )
    throw new ApiError( "You cannot set users to a higher permission level than your own." );
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId } );

  const user = res.locals.user
  if ( !user ) throw new ApiError( `User not found.`, 404 );
  const result = await data.updateUser( userId, updates );
  res.json( result );
});

routes.delete('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  const minimumRole = UserRole.UserManager;
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId } );

  const user = res.locals.user
  if ( !user ) throw new ApiError( `User not found.`, 404 );
  const result = await data.deleteUser( userId );
  res.json( result );
});

//// USER ENTRIES ////

routes.get( '/users/:userId/entries', async (req, res) => {
  const userId = req.params.userId;
  
  const minimumRole = UserRole.Admin;
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId } );
  
  const user = res.locals.user
  if ( !user ) throw new ApiError( `User not found.`, 404 );

  const entries = await data.getUserEntries( userId );
  res.json( entries );
} );

//// ENTRIES ////

routes.get( '/entries', async (req, res) => {
  const minimumRole = UserRole.Admin;
  await validation.checkPermissions( res.locals.caller, { minimumRole } );
  
  const entries = await data.getEntries();
  res.json( entries );
} );

routes.put('/entries', async (req, res) => {
  const { userId, day, duration, notes } = req.body;
  
  const minimumRole = UserRole.Admin;
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId } );

  const result = await data.addEntry( userId, day, duration, notes );
  res.json( result );
});

routes.get( '/entries/:entryId', async (req, res) => {
  const minimumRole = UserRole.Admin;
  const entry = res.locals.entry
  if ( !entry ) throw new ApiError( `Entry not found.`, 404 );
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId : entry.userId } );
  
  res.json( entry );
} );

routes.patch('/entries/:entryId', async (req, res) => {
  interface EntryData { day:number , duration:number , notes:string[] };
  const updates:EntryData = req.body;
  const entryId = req.params.entryId;

  const minimumRole = UserRole.Admin;
  const entry = res.locals.entry
  if ( !entry ) throw new ApiError( `Entry not found.`, 404 );
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId : entry.userId } );
  
  const result = await data.updateEntry( entryId, updates );
  res.json( result );
});

routes.delete('/entries/:entryId', async (req, res) => {
  const minimumRole = UserRole.Admin;
  const entry = res.locals.entry
  if ( !entry ) throw new ApiError( `Entry not found.`, 404 );
  await validation.checkPermissions( res.locals.caller, { minimumRole, userId : entry.userId } );

  const result = await data.deleteEntry( entry.id );
  res.json( result );
});

routes.use( () => { throw new ApiError( "Invalid route.", 404 ) } );

routes.use( handleError );

export default routes;