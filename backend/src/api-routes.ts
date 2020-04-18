import express from 'express';
import data from './datamanager';
import ApiError from './api-errors';
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
    // if ( ! user ) 
    //   throw new ApiError( "Your user does not exist. Please login again with a valid user.", 401 )
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
  const { username, password } = req.body;
  const user = await data.checkUserCredentials( username, password );
  const { accessToken, refreshToken } = authenticateUser( user );
  res.status(201).send( { accessToken, refreshToken } );
} );

//// USERS ////

routes.get( '/users', async (req, res) => {
  const minimumRole = UserRole.UserManager;
  const caller = await validation.getRequestingUser( req );
  await validation.checkPermissions( caller, { minimumRole } );
  res.json( await data.getUsers() );
} );

routes.put('/users', async (req, res) => {
  const { username, password, role } = req.body;
  
  const minimumRole = UserRole.UserManager;
  const caller = await validation.getRequestingUser( req );
  if ( caller.role < role )
    throw new ApiError( "You cannot create users with higher permission level than your own." );
  await validation.checkPermissions( caller, { minimumRole } );

  const user = await data.addUser( username, password, role );
  res.json( user );
});

routes.get( '/users/:id', async (req, res) => {
  const userId = req.params.id;
  
  const minimumRole = UserRole.UserManager;
  const caller = await validation.getRequestingUser( req );
  await validation.checkPermissions( caller, { minimumRole, userId } );
  
  const user = await data.getUserById( userId );
  if ( !user ) throw new ApiError( `User not found.`, 404 );
  res.json( user );
} );

routes.patch('/users/:id', async (req, res) => {
  interface UserData { username:string, password:string, role:number };
  const userId = req.params.id;
  const updates:UserData = req.body;

  const minimumRole = UserRole.UserManager;
  const caller = await validation.getRequestingUser( req );
  if ( updates.role && caller.role < updates.role )
    throw new ApiError( "You cannot set users to a higher permission level than your own." );
  await validation.checkPermissions( caller, { minimumRole, userId } );
    
  const result = await data.updateUser( userId, updates );
  if ( !result ) throw new ApiError( `User not found.`, 404 );
  res.json( result );
});

routes.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;
  
  const minimumRole = UserRole.UserManager;
  const caller = await validation.getRequestingUser( req );
  await validation.checkPermissions( caller, { minimumRole, userId } );

  const result = await data.deleteUser( userId );
  if ( !result ) throw new ApiError( `User not found.`, 404 );
  res.json( result );
});

//// USER ENTRIES ////

routes.get( '/users/:id/entries', async (req, res) => {
  const userId = req.params.id;
  
  const minimumRole = UserRole.Admin;
  const caller = await validation.getRequestingUser( req );
  await validation.checkPermissions( caller, { minimumRole, userId } );
  
  const user = await data.getUserById( userId );
  if ( !user ) throw new ApiError( `User not found.`, 404 );

  const entries = await data.getUserEntries( userId );
  res.json( entries );
} );

//// ENTRIES ////

routes.get( '/entries', async (req, res) => {
  const minimumRole = UserRole.Admin;
  const caller = await validation.getRequestingUser( req );
  await validation.checkPermissions( caller, { minimumRole } );
  
  const entries = await data.getEntries();
  res.json( entries );
} );

routes.put('/entries', async (req, res) => {
  const { userId, day, duration, notes } = req.body;
  
  const minimumRole = UserRole.Admin;
  const caller = await validation.getRequestingUser( req );
  await validation.checkPermissions( caller, { minimumRole, userId } );

  const result = await data.addEntry( userId, day, duration, notes );
  res.json( result );
});

routes.get( '/entries/:id', async (req, res) => {
  const entryId = req.params.id;
  
  const minimumRole = UserRole.Admin;
  const caller = await validation.getRequestingUser( req );
  const entry = await data.getEntry( entryId );
  if ( !entry ) throw new ApiError( `Entry not found.`, 404 );
  await validation.checkPermissions( caller, { minimumRole, userId : entry.userId } );
  
  res.json( entry );
} );

routes.patch('/entries/:id', async (req, res) => {
  interface EntryData { day:number , duration:number , notes:string[] };
  const updates:EntryData = req.body;
  const entryId = req.params.id;

  const minimumRole = UserRole.Admin;
  const caller = await validation.getRequestingUser( req );
  const entry = await data.getEntry( entryId );
  if ( !entry ) throw new ApiError( `Entry not found.`, 404 );
  await validation.checkPermissions( caller, { minimumRole, userId : entry.userId } );
  
  const result = await data.updateEntry( entryId, updates );
  res.json( result );
});

routes.delete('/entries/:id', async (req, res) => {
  const entryId = req.params.id;
  
  const minimumRole = UserRole.Admin;
  const caller = await validation.getRequestingUser( req );
  const entry = await data.getEntry( entryId );
  if ( !entry ) throw new ApiError( `Entry not found.`, 404 );
  await validation.checkPermissions( caller, { minimumRole, userId : entry.userId } );

  const result = await data.deleteEntry( entry.id );
  res.json( result );
});

export default routes;