import mongoose from 'mongoose';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';

import dotenv from "dotenv";
dotenv.config();

import config from './configuration';
import api from './api/api.route';

const app = express();

app.set( 'trust proxy', 1 );
app.use( helmet() );
app.use( cors() );
app.use( express.json() );
app.use( morgan('dev') );

//// API
app.use( "/api", api );

//// Single-page React App (wip)
app.use( '/', express.static( '../frontend/public' ) );
app.use( '*', express.static( '../frontend/public/404.html' ) );

const connectToDatabase = async() => 
{
  const dbUri:string = `${config.DATABASE_URL}?authSource=${config.DATABASE_AUTHDB}`;
  const dbOptions:mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: {
     user: config.DATABASE_USERNAME!,
     password: config.DATABASE_PASSWORD!,
    },
  };
  mongoose.set( 'useCreateIndex', true );
  mongoose.set( 'useFindAndModify', false );
  await mongoose.connect( dbUri, dbOptions );
  console.log(`Connected to database ${ config.DATABASE_URL }`);
}

( async function() {
  await connectToDatabase();
  app.listen( config.PORT, () => console.log( `> Running on port ${ config.PORT }.` ) );
} )()
.catch( e => console.error( e ) )