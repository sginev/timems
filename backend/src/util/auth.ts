import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import ApiError from '../api-errors';
import { IUser } from '../models/User';

const JWT_SECRET = "sekret"

const makeSalt = () => crypto.randomBytes(32).toString( 'base64' );
const makeHash = ( subject:string, salt:string ) => //// TODO: Use bcrypt?
  crypto.createHmac( 'sha512', salt ).update( subject ).digest( 'base64' );

interface JWTData { userId : string , refreshKey : string , iat : number }

export const authenticateUser = ( user:IUser ) => {
  const secret = JWT_SECRET
  const refreshId = user.id + secret;
  const salt = makeSalt()
  const hash = makeHash( refreshId, salt )
  const accessToken = jwt.sign( { userId : user.id, refreshKey : salt }, secret )
  const refreshToken = Buffer.from( hash ).toString('base64');
  return { accessToken, refreshToken }
}

export const validateToken = ( authorizationHeader?:string ) => {
  if ( ! authorizationHeader ) 
    throw new ApiError( "Authentication header missing", 401 );
  const [ headerKey, authenticationToken ] = authorizationHeader.split(' ');
  if ( headerKey !== 'Bearer' ) 
    throw new ApiError( "Wrong authentication type", 401 );
  const data = jwt.verify( authenticationToken, JWT_SECRET );
  return data as JWTData
}; 