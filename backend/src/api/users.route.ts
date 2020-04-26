import express from 'express';

import data from '../datamanager';
import ApiError from '../types/ApiError';
import { checkPermissions } from '../util/auth';
import { UserRole } from "shared/interfaces/UserRole";
import { IUser } from '../models/User';

const routes = express.Router();

routes.param( 'id', async (_, res, next, id) => {
  res.locals.user = ( await data.users.getById( id ) )?.toJSON();
  next()
} );

routes.get( '/', async (_, res, next) => {
  const minimumRole = UserRole.UserManager;
  await checkPermissions( res.locals.caller, { minimumRole } );
  const users = await data.users.getAll()
  res.locals.data = { users };
  next();
} );

routes.get( '/:id', async (req, res, next) => {
  const user = res.locals.user;
  if ( !user ) 
    throw new ApiError( `User not found.`, 404 );
  const userId = user.id;  
  const minimumRole = UserRole.UserManager;
  await checkPermissions( res.locals.caller, { minimumRole, userId } );
  res.locals.data = { user }
  next();
} );

routes.put('/', async (req, res, next) => {
  const { username, password, role } = req.body;
  const minimumRole = UserRole.UserManager;
  await checkPermissions( res.locals.caller, { minimumRole } );
  if ( res.locals.caller.role < role )
    throw new ApiError( "You cannot create users with higher permission level than your own." );
  const user = await data.users.add( username, password, role || UserRole.Member );
  res.locals.data = { user }
  next();
});

routes.post('/:id', async (req, res, next) => {
  const user = res.locals.user as IUser
  if ( !user ) 
    throw new ApiError( `User not found.`, 404 );
  const updates = {
    username : req.body.username,
    password : req.body.password,
    role : req.body.role,
    preferredWorkingHoursPerDay: req.body.preferredWorkingHoursPerDay,
  }
  const minimumRole = Math.max( UserRole.UserManager, user.role ) as UserRole;
  await checkPermissions( res.locals.caller, { minimumRole, userId : user.id } );
  if ( updates.role && res.locals.caller.role < updates.role )
    throw new ApiError( "You cannot set users to a higher permission level than your own." );
  const updatedUser = await data.users.update( user.id, updates );
  res.locals.data = { user : updatedUser };
  next();
});

routes.delete('/:id', async (req, res, next) => {
  const user = res.locals.user as IUser
  if ( !user ) 
    throw new ApiError( `User not found.`, 404 );
  const minimumRole = Math.max( UserRole.UserManager, user.role ) as UserRole;
  await checkPermissions( res.locals.caller, { minimumRole, userId : user.id } );
  await data.users.delete( user.id );
  res.locals.data = {};
  next();
});

export default routes;