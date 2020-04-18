import crypto from 'crypto';

const makeSalt = () => crypto.randomBytes(32).toString( 'base64' );
const hashPassword = ( raw:string, salt:string ) => ////TODO: Use bcrypt?
  crypto.createHmac( 'sha512', salt ).update( raw ).digest( 'base64' );

export const encryptPassword = ( raw:string ) => {
  // return crypto.createHash('md5').update( raw ).digest("hex");
  const salt = makeSalt()
  const hash = hashPassword( raw, salt )
  return salt + '$' + hash;
}
export const comparePassword = ( password:string, passwordRecord:string ) => {
  const [ salt, hash ] = passwordRecord.split('$')
  return hash === hashPassword( password, salt );
}
