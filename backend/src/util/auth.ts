import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import ApiError from '../api-errors';

const JWT_SECRET = "sekret"

const makeSalt = () => crypto.randomBytes(32).toString( 'base64' );
const makeHash = ( subject:string, salt:string ) => ////TODO: Use bcrypt?
  crypto.createHmac( 'sha512', salt ).update( subject ).digest( 'base64' );

export const authenticateUser = ( userId:string, body:any ) => {
  const secret = JWT_SECRET
  const refreshId = userId + secret;
  const salt = makeSalt()
  const hash = makeHash( refreshId, salt )
  const accessToken = jwt.sign( { ...body, refreshKey : salt }, secret )
  const refreshToken = new Buffer( hash ).toString('base64');
  return { accessToken, refreshToken }
}

export const validateJWT = async (req, res, next) => {
  if ( ! req.headers['authorization'] ) 
    throw new ApiError( "Authentication header missing", 401 );
  const [ headerKey, authenticationToken ] = req.headers['authorization'].split(' ');
  if ( headerKey !== 'Bearer' ) 
    throw new ApiError( "Wrong authentication type", 401 );
  const secret = JWT_SECRET;
  req.jwt = jwt.verify( authenticationToken, secret );
  console.log( req.jwt )
  next()
}; 