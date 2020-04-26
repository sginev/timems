import express from 'express';

import data from '../datamanager';
import ResponseWithCaller from '../types/ResponseWithCaller'
import { IEntry } from '../models/Entry';
import { assertAccess, assertFound, assert } from '../util/assertions';
import Validator from 'shared/validation/Validator';

const routes = express.Router();

//// Middleware

routes.param( 'id', async (_, res, next, id) => {
  res.locals.entry = ( await data.entries.getById( id ) )?.toJSON();
  next()
} );

type Response = ResponseWithCaller & { locals: { entry?:IEntry } };

//// Routes

routes.get( '/', async (req, res:Response, next) => {
  const options = req.query;
  const userId = options.userId as string;
  assertAccess( userId === res.locals.caller.id ?
                res.locals.access.read.own.entry :
                res.locals.access.read.any.entry );
  res.locals.data = await data.entries.getPaginated( options );
  next();
} );

routes.get( '/:id', async (_, res:Response, next) => {
  const entry = res.locals.entry!;
  assertFound( entry, `Entry` );
  assertAccess( entry.userId === res.locals.caller.id ?
                res.locals.access.read.own.entry :
                res.locals.access.read.any.entry );
  res.locals.data = { entry };
  next();
} );

routes.put('/', async (req, res:Response, next) => {
  const { userId, day, duration, notes } = req.body;
  assertAccess( userId === res.locals.caller.id ?
                res.locals.access.create.own.entry :
                res.locals.access.create.any.entry );
  const entry = await data.entries.add( userId, day, duration, notes );
  res.locals.data = { entry };
  next();
});

routes.post('/:id', async (req, res:Response, next) => {
  let entry = res.locals.entry!;
  assertFound( entry, `Entry` );
  assertAccess( entry.userId === res.locals.caller.id ?
                res.locals.access.update.own.entry :
                res.locals.access.update.any.entry );
  interface EntryData { day:number , duration:number , notes:string };
  const updates:EntryData = req.body;
  const entryId = req.params.id;
  entry = await data.entries.update( entryId, updates ) as IEntry;
  res.locals.data = { entry };
  next();
});

routes.delete('/:id', async (_, res:Response, next) => {
  const entry = res.locals.entry!;
  assertFound( entry, `Entry` );
  assertAccess( entry.userId === res.locals.caller.id ?
                res.locals.access.delete.own.entry :
                res.locals.access.delete.any.entry );
  await data.entries.delete( entry.id );
  res.locals.data = {};
  next();
});

export default routes;