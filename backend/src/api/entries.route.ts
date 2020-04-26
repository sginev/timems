import express from 'express';

import data from '../data/datamanager';
import ResponseWithCaller from './types/ResponseWithCaller'
import { IEntry } from '../data/models/Entry';
import { assertAccess, assertFound, assert, assertValidated } from './util/assertions';
import validation from 'shared/validation/Validator';

const routes = express.Router();

//// Middleware

routes.param( 'id', async (_, res, next, id) => {
  res.locals.entry = ( await data.entries.getById( id ) )?.toJSON();
  next()
} );

type Response = ResponseWithCaller & { locals: { entry?:IEntry } };

//// Routes

routes.get( '/', async (req, res:Response, next) => {
  assertValidated( validation.api.entry.list.validate( req.query ) );
  assertAccess( req.query.userId == res.locals.caller.id ?
                res.locals.access.read.own.entry :
                res.locals.access.read.any.entry );
  res.locals.data = await data.entries.getPaginated( req.query );
  next();
} );

routes.get( '/:id', async (_, res:Response, next) => {
  const entry = res.locals.entry!;
  assertFound( entry, `Entry` );
  assertAccess( entry.userId == res.locals.caller.id ?
                res.locals.access.read.own.entry :
                res.locals.access.read.any.entry );
  res.locals.data = { entry };
  next();
} );

routes.put('/', async (req, res:Response, next) => {
  const { userId, day, duration, notes } = req.body;
  assertValidated( validation.api.entry.create.validate( req.body ) )
  assertAccess( userId == res.locals.caller.id ?
                res.locals.access.create.own.entry :
                res.locals.access.create.any.entry );
  const entry = await data.entries.add( userId, day, duration, notes );
  res.locals.data = { entry };
  next();
});

routes.post('/:id', async (req, res:Response, next) => {
  assertValidated( validation.api.entry.update.validate( req.body ) )
  assertFound( res.locals.entry, `Entry` );
  assertAccess( req.params.id == res.locals.caller.id ?
                res.locals.access.update.own.entry :
                res.locals.access.update.any.entry );
  const entry = await data.entries.update( req.params.id, req.body ) as IEntry;
  res.locals.data = { entry };
  next();
});

routes.delete('/:id', async (req, res:Response, next) => {
  assertFound( res.locals.entry, `Entry` );
  assertAccess( res.locals.entry!.userId === res.locals.caller.id ?
                res.locals.access.delete.own.entry :
                res.locals.access.delete.any.entry );
  await data.entries.delete( req.params.id );
  res.locals.data = {};
  next();
});

export default routes;