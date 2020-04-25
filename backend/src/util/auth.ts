import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { UserRole } from "shared/interfaces/UserRole";
import { IUser } from '../models/User';
import ApiError from '../types/ApiError';

const JWT_SECRET = "sekret"

const makeSalt = () => crypto.randomBytes(32).toString( 'base64' );
const makeHash = ( subject:string, salt:string ) => //// TODO: Use bcrypt?
  crypto.createHmac( 'sha512', salt ).update( subject ).digest( 'base64' );

interface JWTData { userId : string , refreshKey : string , iat : number }

export async function authenticateUser( user:IUser )
{
  const secret = JWT_SECRET
  const refreshId = user.id + secret;
  const salt = makeSalt()
  const hash = makeHash( refreshId, salt )
  const accessToken = jwt.sign( { userId : user.id, refreshKey : salt }, secret )
  const refreshToken = Buffer.from( hash ).toString('base64');
  return { accessToken, refreshToken }
}

export async function validateToken( authorizationHeader?:string )
{
  if ( ! authorizationHeader ) 
    throw new ApiError( "Authentication header missing", 401 );
  const [ headerKey, authenticationToken ] = authorizationHeader.split(' ');
  if ( headerKey !== 'Bearer' ) 
    throw new ApiError( "Wrong authentication type", 401 );
  const data = jwt.verify( authenticationToken, JWT_SECRET );
  return data as JWTData
}; 

//// throws error if ALL check options fail
export async function checkPermissions( user:IUser, options:{ minimumRole?:UserRole, userId?:string } )
{
  if ( options.userId && user.id === options.userId ) 
    return
  if ( options.minimumRole && user.role >= options.minimumRole ) 
    return
  throw new ApiError( "Access denied.", 403 );
}