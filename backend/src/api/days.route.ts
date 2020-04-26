import express from 'express';

import data from '../data/datamanager';
import ResponseWithCaller from './types/ResponseWithCaller'
import { IEntry } from '../data/models/Entry';
import { IUser } from '../data/models/User';
import { assertAccess, assertFound, assert, assertValidated } from './util/assertions';
import validation from 'shared/validation/Validator';

const routes = express.Router();
type Response = ResponseWithCaller & { locals: { user?:IUser } };

//// Routes

routes.get( '/', async (req, res:Response, next) => {
  assertValidated( validation.api.entry.list.validate( req.query ) );
  assertAccess( req.query.userId == res.locals.caller.id ?
                res.locals.access.read.own.entry :
                res.locals.access.read.any.entry );
  res.locals.data = await data.days.getAll( req.query.userId as string );
  next();
} );

export default routes;