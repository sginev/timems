import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import 'express-async-errors';

import ApiError, { handleError } from './api-errors';
import { DataManager } from './datamanager';
import { authenticateUser, validateToken } from './util/auth';
import { UserRole, User } from './models';

const data = new DataManager()
const app = express();

app.set( 'trust proxy', 1 );
app.use( helmet() );
app.use( cors() );
app.use( bodyParser.json() );
app.use( morgan('tiny') );



const validation = new class {
  constructor( private data:DataManager ) {}

  async getRequestingUser( req:express.Request ) {
    const id = validateToken( req.headers['authorization'] ).userId;
    const user = await data.getUserById( id )
    if ( ! user ) 
      throw new ApiError( "Your user does not exist. Please login again with a valid user.", 401 )
    return user
  }
  
  //// throws error if ALL check options fail
  async checkPermissions( user:User, options:{ minimumRole?:UserRole, userId?:string } ) {
    // if ( ! user ) 
    //   throw new ApiError( "Your user does not exist. Please login again with a valid user.", 401 )
    if ( options.userId && user.id === options.userId ) 
      return
    if ( options.minimumRole && user.role >= options.minimumRole ) 
      return
    throw new ApiError( "Access denied.", 403 )
  }
}( data );



app.post( '/register', async (req, res) => {
  const { username, password } = req.body
  const user = await data.addUser( username, password, UserRole.Member );
  const { accessToken, refreshToken } = authenticateUser( user )
  res.status(201).send( { accessToken, refreshToken } );
} );

app.post( '/login', async (req, res) => {
  const { username, password } = req.body
  const user = await data.checkUserCredentials( username, password )
  const { accessToken, refreshToken } = authenticateUser( user )
  res.status(201).send( { accessToken, refreshToken } );
} );



app.get( '/users', async (req, res) => {
  const minimumRole = UserRole.UserManager;
  const caller = await validation.getRequestingUser( req );
  await validation.checkPermissions( caller, { minimumRole } );
  res.json( await data.getUsers() );
} );

app.put('/users', async (req, res) => {
  const { username, password, role } = req.body;
  
  const minimumRole = UserRole.UserManager;
  const caller = await validation.getRequestingUser( req );
  if ( caller.role < role )
    throw new ApiError( "You cannot create users with higher permission level than your own." )
  await validation.checkPermissions( caller, { minimumRole } )

  const user = await data.addUser( username, password, role );
  res.json( user );
});

app.get( '/users/:id', async (req, res) => {
  const userId = req.params.id;
  
  const minimumRole = UserRole.UserManager;
  const caller = await validation.getRequestingUser( req );
  await validation.checkPermissions( caller, { minimumRole, userId } )
  
  const user = await data.getUserById( userId );
  if ( ! user ) throw new ApiError( `User not found.`, 404 )
  res.json( user );
} );

app.patch('/users/:id', async (req, res) => {
  interface UserData { username:string, password:string, role:number };
  const userId = req.params.id;
  const updates:UserData = req.body;

  const minimumRole = UserRole.Member;
  const caller = await validation.getRequestingUser( req );
  if ( updates.role && caller.role < updates.role )
    throw new ApiError( "You cannot set users to a higher permission level than your own." )
  await validation.checkPermissions( caller, { minimumRole } )
    
  const result = await data.updateUser( userId, updates );
  if ( ! result ) throw new ApiError( `User not found.`, 404 )
  res.json( result );
});

app.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;
  
  const minimumRole = UserRole.UserManager;
  const caller = await validation.getRequestingUser( req );
  await validation.checkPermissions( caller, { minimumRole, userId } )

  const result = await data.deleteUser( userId );
  if ( ! result ) throw new ApiError( `User not found.`, 404 )
  res.json( result );
});



app.use( () => { throw new ApiError( "Invalid route.", 404 ) } );

app.use( handleError );

( async function() {
  await data.initialize()
  app.listen( 3000, () => console.log('listening on port 3000') );
} )()
.catch( e => console.error( e ) )