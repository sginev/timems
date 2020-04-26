import express from 'express';

import data from '../datamanager';
import ResponseWithCaller from '../types/ResponseWithCaller'
import { IUser } from '../models/User';
import { UserRole } from "shared/interfaces/UserRole";
import { assertAccess, assertFound, assert, assertValidated } from '../util/assertions';
import Validator from 'shared/validation/Validator';

const routes = express.Router();

//// Middleware

routes.param( 'id', async (_, res, next, id) => {
  res.locals.user = ( await data.users.getById( id ) )?.toJSON();
  next()
} );

type Response = ResponseWithCaller & { locals: { user?:IUser } }

//// Routes

routes.get( '/', async (req, res:Response, next) => {
  assertAccess( res.locals.access.read.any.user );
  const options = req.query;
  res.locals.data = await data.users.getPaginated( options );
  next();
} );

routes.get( '/:id', async (req, res:Response, next) => {
  const user = res.locals.user;
  assertFound( user, 'User' );
  assertAccess( user!.id === res.locals.caller.id ?
                res.locals.access.read.own.user :
                res.locals.access.read.any.user );
  res.locals.data = { user }
  next();
} );

routes.put('/', async (req, res:Response, next) => {
  assertAccess( res.locals.access.create.any.user );
  assertValidated( Validator.ApiUserCreate.validate( req.body ) );
  const { username, password, role } = req.body;
  assert( res.locals.caller.role >= role, 
    "You cannot create users with higher permission level than your own.", 403 );
  const user = await data.users.add( username, password, role || UserRole.Member );
  res.locals.data = { user }
  next();
});

routes.post('/:id', async (req, res:Response, next) => {
  const user = res.locals.user as IUser;
  assertFound( user, 'User' );
  assertValidated( Validator.ApiUserUpdate.validate( req.body ) );
  const updates = {
    username : req.body.username,
    password : req.body.password,
    role : req.body.role,
    preferredWorkingHoursPerDay: req.body.preferredWorkingHoursPerDay,
  }
  assertAccess( user!.id === res.locals.caller.id ?
                res.locals.access.update.own.user :
                res.locals.access.update.any.user );

  console.log( res.locals.caller.role , 'vs' , user.role )
  assert( res.locals.caller.role >= user.role,
    `You cannot edit users with higher permission level than your own`, 403 );
  assert( !updates.role || res.locals.caller.role >= updates.role,
    "You cannot set users to a higher permission level than your own.", 403 );
  assert( !updates.role || user.id !== res.locals.caller.id,
    "You cannot change your own role.", 403 );
  const updatedUser = await data.users.update( user.id, updates );
  res.locals.data = { user : updatedUser };
  next();
});

routes.delete('/:id', async (req, res:Response, next) => {
  const user = res.locals.user as IUser;
  assertFound( user, 'User' )
  assertAccess( user!.id === res.locals.caller.id ?
                res.locals.access.delete.own.user :
                res.locals.access.delete.any.user );
  assert( user.role !== UserRole.Admin || user.id !== res.locals.caller.id,
    "You cannot delete your own account if you are an Administrator.", 403 );
  assert( res.locals.caller.role >= user.role,
    `You cannot delete users with higher permission level than your own`, 403 );
  await data.users.delete( user.id );
  res.locals.data = {};
  next();
});

export default routes;