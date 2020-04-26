import express from 'express';

import data from '../data/datamanager';
import ResponseWithCaller from './types/ResponseWithCaller'
import { IUser } from '../data/models/User';
import { assertAccess, assertValidated } from './util/assertions';
import validation from 'shared/validation/Validator';

const routes = express.Router();
type Response = ResponseWithCaller & { locals: { user?:IUser } };

//// Routes

routes.get( '/', async (req, res:Response, next) => {
  assertValidated( validation.api.day.list.validate( req.query ) );
  assertAccess( req.query.userId == res.locals.caller.id ?
                res.locals.access.read.own.entry :
                res.locals.access.read.any.entry );
  res.locals.data = await data.days.getPaginated( req.query );
  next();
} );

export default routes;