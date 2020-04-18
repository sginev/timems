import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import 'express-async-errors';

import ApiError, { handleError } from './api-errors';
import { DataManager } from './datamanager';
import { authenticateUser } from './util/auth';

const db = new DataManager()
const app = express();

app.set( 'trust proxy', 1 );
app.use( helmet() );
app.use( cors() );
app.use( bodyParser.json() );
app.use( morgan('tiny') );

app.get('/', async (req, res) => {
  res.json( {
    users : await db.getUsers(),
    entries : await db.getEntries(),
  } );
});

app.post('/auth', async (req, res) => {
  const { username, password } = req.body
  const user = await db.checkUserCredentials( username, password )
  const { accessToken, refreshToken } = authenticateUser( user.id, req.body )
  res.status(201).send( { accessToken, refreshToken } );
});

app.get('/users', async (req, res) => {
  res.json( await db.getUsers() );
});

app.get('/users/:id', async (req, res) => {
  // const user = await db.getUserByUsername( req.params.username );
  const id = req.body.id;
  const user = await db.getUserById( id );
  if ( ! user ) throw new ApiError( `User not found.`, 404 )
  res.json( user );
});

app.post('/users', async (req, res) => {
  interface NewUserData { username:string, password:string, role:number };
  const data:NewUserData = req.body;
  const user = await db.addUser( data.username, data.password, data.role );
  res.json( user );
});

app.put('/users/:id', async (req, res) => {
  interface UserData { id:string, username:string, password:string, role:number };
  const id = req.body.id;
  const updates:UserData = req.body;
  delete updates.id;
  const user = await db.updateUser( id, updates );
  res.json( user );
});

app.delete('/users/:id', async (req, res) => {
  const id = req.body.id;
  const result = await db.deleteUser( id );
  if ( ! result ) throw new ApiError( `User not found.`, 404 )
  res.json( result );
});

app.use( () => { throw new ApiError( "Invalid route", 404 ) } );

app.use( handleError );

( async function() {
  await db.initialize()
  app.listen( 3000, () => console.log('listening on port 3000') );
} )()
.catch( e => console.error( e ) )