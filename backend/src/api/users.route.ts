import express from 'express';

import data from '../data/datamanager';
import ResponseWithCaller from './types/ResponseWithCaller'
import { IUser } from '../data/models/User';
import { UserRole } from "shared/interfaces/UserRole";
import { assertAccess, assertFound, assert, assertValidated } from './util/assertions';
import validation from 'shared/validation/Validator';

const routes = express.Router();

//// Middleware

routes.param( 'id', async (_, res, next, id) => {
  res.locals.user = ( await data.users.getById( id ) )?.toJSON();
  next()
} );

type Response = ResponseWithCaller & { locals: { user?:IUser } }

//// Routes

routes.get( '/', async (req, res:Response, next) => {
  assertValidated( validation.api.user.list.validate( req.query ) );
  assertAccess( res.locals.access.read.any.user );
  res.locals.data = await data.users.getPaginated( req.query );
  next();
} );

routes.get( '/:id', async (req, res:Response, next) => {
  const user = res.locals.user;
  assertFound( user, 'User' );
  assertAccess( user!.id == res.locals.caller.id ?
                res.locals.access.read.own.user :
                res.locals.access.read.any.user );
  res.locals.data = { user }
  next();
} );

routes.put('/', async (req, res:Response, next) => {
  assertValidated( validation.api.user.create.validate( req.body ) );
  assertAccess( res.locals.access.create.any.user );
  const { username, password } = req.body;
  const role = req.body.role || UserRole.Member;
  assert( res.locals.caller.role >= role, 
    "You cannot create users with higher permission level than your own.", 403 );
  const user = await data.users.add( username, password, role );
  res.locals.data = { user : await data.users.getById( user.id ) };
  next();
});

routes.post('/:id', async (req, res:Response, next) => {
  assertValidated( validation.api.user.update.validate( req.body ) );
  assertFound( res.locals.user, 'User' );
  const updates = {
    username : req.body.username,
    password : req.body.password,
    role : req.body.role,
    preferredWorkingHoursPerDay: req.body.preferredWorkingHoursPerDay,
  };
  assertAccess( res.locals.user!.id == res.locals.caller.id ?
                res.locals.access.update.own.user :
                res.locals.access.update.any.user );
  assert( res.locals.caller.role >= res.locals.user!.role,
    `You cannot edit users with higher permission level than your own`, 403 );
  assert( !updates.role || res.locals.caller.role >= updates.role,
    "You cannot set users to a higher permission level than your own.", 403 );
  assert( !updates.role || res.locals.user!.id !== res.locals.caller.id,
    "You cannot change your own role.", 403 );
  const updatedUser = await data.users.update( req.params.id, updates );
  res.locals.data = { user : updatedUser };
  next();
});

routes.delete('/:id', async (req, res:Response, next) => {
  assertFound( res.locals.user, 'User' );
  assertAccess( res.locals.user!.id == res.locals.caller.id ?
                res.locals.access.delete.own.user :
                res.locals.access.delete.any.user );
  assert( res.locals.user!.role !== UserRole.Admin || res.locals.user!.id !== res.locals.caller.id,
    "You cannot delete your own account if you are an Administrator.", 403 );
  assert( res.locals.caller.role >= res.locals.user!.role,
    `You cannot delete users with higher permission level than your own`, 403 );
  await data.users.delete( req.params.id );
  res.locals.data = {};
  next();
});

export default routes;