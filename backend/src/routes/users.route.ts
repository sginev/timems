import express from 'express';

import data from '../datamanager';
import ApiError from '../api-errors';
import { checkPermissions } from './auth.route';
import { UserRole } from '../models/User';

const routes = express.Router();

routes.param( 'id', async (_, res, next, id) => {
  res.locals.user = ( await data.users.getById( id ) )?.toJSON();
  next()
} );

routes.get( '/', async (_, res, next) => {
  const minimumRole = UserRole.UserManager;
  await checkPermissions( res.locals.caller, { minimumRole } );
  res.locals.data = await data.users.getAll();
  next();
} );

routes.get( '/:id', async (req, res, next) => {
  const userId = req.params.id;  
  const minimumRole = UserRole.UserManager;
  await checkPermissions( res.locals.caller, { minimumRole, userId } );
  const user = res.locals.user;
  if ( !user ) 
    throw new ApiError( `User not found.`, 404 );
  res.locals.data = { user }
  next();
} );

routes.put('/users', async (req, res, next) => {
  const { username, password, role } = req.body;
  const minimumRole = UserRole.UserManager;
  await checkPermissions( res.locals.caller, { minimumRole } );
  if ( res.locals.caller.role < role )
    throw new ApiError( "You cannot create users with higher permission level than your own." );
  const user = await data.users.add( username, password, role || UserRole.Member );
  res.locals.data = user
  next();
});

routes.patch('/:id', async (req, res, next) => {
  const userId = req.params.userId;
  const updates = {
    username : req.body.username,
    password : req.body.password,
    role : req.body.role,
    preferredWorkingHoursPerDay: req.body.preferredWorkingHoursPerDay,
  }
  const minimumRole = UserRole.UserManager;
  await checkPermissions( res.locals.caller, { minimumRole, userId } );
  if ( updates.role && res.locals.caller.role < updates.role )
    throw new ApiError( "You cannot set users to a higher permission level than your own." );
  let user = res.locals.user
  if ( !user ) 
    throw new ApiError( `User not found.`, 404 );
  const updatedUser = await data.users.update( userId, updates );
  res.locals.data = updatedUser
  next();
});

routes.delete('/:id', async (req, res, next) => {
  const userId = req.params.userId;
  
  const minimumRole = UserRole.UserManager;
  await checkPermissions( res.locals.caller, { minimumRole, userId } );

  const user = res.locals.user
  if ( !user ) throw new ApiError( `User not found.`, 404 );
  
  await res.locals.user.remove();
  
  res.locals.data = {};
  next();
});

export default routes;