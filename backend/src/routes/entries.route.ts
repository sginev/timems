import express from 'express';

import data from '../datamanager';
import ApiError from '../api-errors';
import { checkPermissions } from './auth.route';
import { UserRole } from 'shared/UserRole';

const routes = express.Router();

routes.param( 'id', async (_, res, next, id) => {
  res.locals.entry = ( await data.entries.getById( id ) )?.toJSON();
  next()
} );

routes.get( '/', async (req, res, next) => {
  const userId = req.query.userId as string;
  const minimumRole = UserRole.Admin;
  await checkPermissions( res.locals.caller, { minimumRole, userId } );
  const options = req.query;
  res.locals.data = await data.entries.getPaginated( options )
  next();
} );

routes.get( '/:id', async (_, res, next) => {
  const entry = res.locals.entry
  if ( !entry ) 
    throw new ApiError( `Entry not found.`, 404 );
  const minimumRole = UserRole.Admin;
  await checkPermissions( res.locals.caller, { minimumRole, userId : entry.userId } );
  res.locals.data = { entry };
  next();
} );

routes.put('/', async (req, res, next) => {
  const { userId, day, duration, notes } = req.body;
  const minimumRole = UserRole.Admin;
  await checkPermissions( res.locals.caller, { minimumRole, userId } );
  res.locals.data = await data.entries.add( userId, day, duration, notes );
  next();
});

routes.post('/:id', async (req, res, next) => {
  interface EntryData { day:number , duration:number , notes:string };
  const updates:EntryData = req.body;
  const entryId = req.params.id;
  let entry = res.locals.entry;
  console.log( req.params.id, entry )
  if ( !entry ) 
    throw new ApiError( `Entry not found.`, 404 );
  const minimumRole = UserRole.Admin;
  await checkPermissions( res.locals.caller, { minimumRole, userId : entry.userId } );
  entry = await data.entries.update( entryId, updates ) 
  res.locals.data = { entry };
  next();
});

routes.delete('/:id', async (_, res, next) => {
  const entry = res.locals.entry
  if ( !entry ) 
    throw new ApiError( `Entry not found.`, 404 );
  const minimumRole = UserRole.Admin;
  await checkPermissions( res.locals.caller, { minimumRole, userId : entry.userId } );
  await data.entries.delete( entry.id )
  res.locals.data = {};
  next();
});

export default routes;