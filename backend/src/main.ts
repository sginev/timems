import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import 'express-async-errors';

import ApiError, { handleError } from './api-errors';
import data from './datamanager';

import api from './api-routes';

const PORT = process.env.PORT || 3000
const app = express();

app.set( 'trust proxy', 1 );
app.use( helmet() );
app.use( cors() );
app.use( bodyParser.json() );
app.use( morgan('dev') );

app.use( "/api", api );

app.use( () => { throw new ApiError( "Invalid route.", 404 ) } );
app.use( handleError );

( async function() {
  await data.initialize()
  app.listen( PORT, () => console.log( `> Running on port ${ PORT }.` ) );
} )()
.catch( e => console.error( e ) )