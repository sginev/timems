import * as uuid from 'uuid';
import low from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';
import Joi from '@hapi/joi';

import ApiError from './api-errors';
import { encryptPassword, comparePassword } from './util/passwords';
import { User, UserRole, Entry } from "./models";

const DATABASE_FILEPATH = `./temp/db4.json`;

interface DBData {
  users : User[]
  entries : Entry[]
}

const validation = {
  user : Joi.object({
    username: Joi.string().alphanum().min(4).max(40).required(),
    password: Joi.string().min(4).max(80).required(),
    role: Joi.number().integer().valid( UserRole.Admin, UserRole.UserManager, UserRole.Member, UserRole.Guest ).required(),
  }),
  user_updates : Joi.object({
    username: Joi.string().alphanum().min(4).max(40),
    password: Joi.string().min(4).max(80),
    role: Joi.number().integer().valid( UserRole.Admin, UserRole.UserManager, UserRole.Member, UserRole.Guest ),
  }),
  entry : Joi.object({
    userId: Joi.string().required(),
    day: Joi.number().integer().min(0).required(),
    duration: Joi.number().required(),
    notes: Joi.array().required(),
  }),
  entry_updates : Joi.object({
    userId: Joi.string(),
    day: Joi.number().integer().min(0),
    duration: Joi.number(),
    notes: Joi.array(),
  }),
}
const validate = <T>( joi:Joi.ObjectSchema<T>, target:T ) => {
  const validationError = joi.validate( target ).error;
  if ( validationError )
    throw new ApiError( validationError.toString() );
}
  

class DataManager 
{
  private millisecondsToDays = ms => ~~( ms / ( 1000 * 60 * 60 * 24 ) )
  private genuuid = uuid.v4;

  private database?:low.LowdbAsync<DBData>
  private get users() { return this.database!.get( 'users', [] ) }
  private get entries() { return this.database!.get( 'entries', [] ) }

  //// USER ////

  public async getUsers() {
    return this.users.value() as User[];
  }

  public async getUserById( id:string ) {
    return this.users.find( { id } ).value() as User|undefined;
  }

  public async getUserByUsername( username:string ) {
    return this.users.find( { username } ).value() as User|undefined;
  }

  public async addUser( username:string, password:string, role:UserRole ) {
    if ( await this.getUserByUsername( username ) )
      throw new ApiError( "Chosen username is already taken.", 409 );

    const id = this.genuuid();
    const passhash = encryptPassword( password );
    const settings = { preferredWorkingHoursPerDay : 0 };

    validate( validation.user, { username, password, role } )

    const user = { id, username, passhash, role, settings }
    await this.users.push( user ).write();
    delete user['passhash'];
    return user as User;
  }

  public async updateUser( id:string, updates:{ username?:string, password?:string, role?:UserRole } ) {
    const user = this.users.find( { id } ).value();
    if ( ! user )
      throw new ApiError( "User does not exist", 404 );
    
    if ( updates.username && updates.username !== user.username )
      if ( await this.getUserByUsername( updates.username ) )
        throw new ApiError( "Chosen username is already taken.", 409 );

    validate( validation.user_updates, updates )
  
    if ( updates.password ) {
      updates['passhash'] = encryptPassword( updates.password );
      delete updates.password;
    }

    const result = await this.users.find( { id } ).assign( updates ).write() as User;
    delete result['passhash'];
    return result;
  }

  public async deleteUser( id:string ) {
    const [ result ] = await this.users.remove( { id } ).write() as User[]
    delete result['passhash']
    return result
  }

  public async checkUserCredentials( username:string, password:string ) {
    const user = await this.getUserByUsername( username )
    if ( ! user ) throw new ApiError( `No user with username '${ username }' found.`, 401 )
    if ( ! comparePassword( password, user.passhash ) ) throw new ApiError( `Wrong password!`, 401 )
    return user
  }

  //// ENTRY ////
  
  public async getEntries() {
    return this.entries.value() as Entry[];
  }

  public async getUserEntries( userId:string ) {
    return this.entries.filter( { userId } ).value() as Entry[];
  }

  public async getEntryById( id:string ) {
    return this.entries.find( { id } ).value() as Entry|undefined;
  }

  public async addEntry( userId:string , day:number , duration:number , notes:string[] ) {
    const user = this.users.find( { id : userId } ).value();
    if ( ! user )
      throw new ApiError( "User does not exist", 404 );
    
    const id = this.genuuid()
    const entry = { id, userId, day, duration, notes }
    validate( validation.entry, entry )
    const [ result ] = await this.entries.push( entry ).write() as Entry[]
    return result
  }

  public async updateEntry( id:string, updates:{ day:number, duration:number, notes:string[] } ) {
    validate( validation.entry_updates, updates )
    const result = this.entries.find( { id } ).assign( updates ).write() as Entry
    return result
  }

  public async deleteEntry( id:string ) {
    const [ result ] = await this.entries.remove( { id } ).write() as Entry[]
    return result
  }

  //// INITIALIZATION ////

  public async initialize() {
    this.database = await low( new FileAsync( DATABASE_FILEPATH ) )
    this.database.defaultsDeep( { users : [], entries : [] } ).write()

    if ( ! (await this.getUsers()).length ) {
      await this.addUser( `admin`, `toptal`, UserRole.Admin )
      await this.addUser( `manager`, `toptal-man`, UserRole.UserManager )
      await this.addUser( `user-red`, `ffoooo`, UserRole.Member )
      await this.addUser( `user-green`, `ooffoo`, UserRole.Member )
      await this.addUser( `user-blue`, `ooooff`, UserRole.Member )
    }

    if ( ! (await this.getEntries()).length ) {
      for ( const u of [ `user-red` , `user-green` , `user-blue` ] ) {
        const userId = ( await this.getUserByUsername( u ) )!.id
        for ( let i = 0 ; i < 14 ; i++ ) {
          await this.addEntry( 
            userId, 
            this.millisecondsToDays( new Date().getTime() ) - ~~( Math.random() * 365 ),
            ~~( 1 + Math.random() * 23 ),
            [ `entry #` + i, `(mock)` ] )
        }
      }
    }
  }
}

export default new DataManager()