import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import 'express-async-errors';

import data from './datamanager';

import api from './api-routes';

const PORT = process.env.PORT || 3000;
const app = express();

app.set( 'trust proxy', 1 );
app.use( helmet() );
app.use( cors() );
app.use( bodyParser.json() );
app.use( morgan('dev') );

//// API
app.use( "/api", api );

//// Single-page React App (wip)
app.use( '/', express.static( '../frontend/public' ) );
app.use( '*', express.static( '../frontend/public/404.html' ) );

( async function() {
  await data.initialize();
  app.listen( PORT, () => console.log( `> Running on port ${ PORT }.` ) );
} )()
.catch( e => console.error( e ) )