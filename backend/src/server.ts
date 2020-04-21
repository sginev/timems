import express from 'express'
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import 'express-async-errors';

import config from './configuration';
import data from './datamanager';
import api from './api-routes';

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

( async function() {
  await data.initialize( config.DATABASE_FILEPATH );
  
  if ( config.isDev() )
    await require('../dev/mockdata').populateData( data )

  app.listen( config.PORT, () => console.log( `> Running on port ${ config.PORT }.` ) );
} )()
.catch( e => console.error( e ) )