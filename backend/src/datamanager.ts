import * as uuid from 'uuid';
import low from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';
import Joi from '@hapi/joi';

import ApiError from './api-errors';
import { encryptPassword, comparePassword } from './util/passwords';
import { User, UserRole, Entry } from "./models";

interface DBData {
  users : User[]
  entries : Entry[]
}

type UserUpdates = { username?:string, password?:string, role?:UserRole, preferredWorkingHoursPerDay?:number }
type EntryUpdates = { day:number, duration:number, notes:string }
type EntryFilterOptions = { userId?:string, from?:number, to?:number, limit?:number }

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
    id: Joi.string(),
    userId: Joi.string().required(),
    day: Joi.number().integer().min(0).required(),
    duration: Joi.number().required(),
    notes: Joi.string().required(),
  }),
  entry_updates : Joi.object({
    userId: Joi.string(),
    day: Joi.number().integer().min(0),
    duration: Joi.number(),
    notes: Joi.string(),
  }),
}
const validate = <T>( joi:Joi.ObjectSchema<T>, target:T ) => {
  const validationError = joi.validate( target ).error;
  if ( validationError )
    throw new ApiError( validationError.toString(), 403, "ValidationError" );
}

class DataManager 
{
  private genuuid = uuid.v4;

  private database?:low.LowdbAsync<DBData>
  private get users() { return this.database!.get( 'users', [] ) }
  private get entries() { return this.database!.get( 'entries', [] ) }

  //#region USER 

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

    validate( validation.user, { username, password, role } )

    const id = this.genuuid();
    const passhash = encryptPassword( password );
    const preferredWorkingHoursPerDay = 0;

    const user = { id, username, passhash, role, preferredWorkingHoursPerDay }

    await this.users.push( user ).write();
    return user as User;
  }

  public async updateUser( id:string, updates:UserUpdates ) {
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
    return result;
  }

  public async deleteUser( id:string ) {
    const [ result ] = await this.users.remove( { id } ).write() as User[]
    return result
  }

  public async checkUserCredentials( username:string, password:string ) {
    const user = await this.getUserByUsername( username )
    if ( ! user ) throw new ApiError( `No user with username '${ username }' found.`, 401 )
    if ( ! comparePassword( password, user.passhash ) ) throw new ApiError( `Wrong password!`, 401 )
    return user
  }

  //#endregion

  //#region ENTRY

  private async updateEntryTotals( userId:string, day?:number ) {
    const groups = day ?
      [ this.entries.filter( { userId, day } ).value() ] :
      Object.values( this.entries.filter( { userId } ).groupBy( 'day' ).value() );
    for ( const group of groups ) {
      const totalDuration = group.reduce( (a,c) => a + c.duration, 0 )
      group.forEach( entry => entry._dailyTotalDuration = totalDuration )
    }
    await this.database?.write()
  }
  
  // private async updateEntryTotals( userId:string, day?:number ) {
  //   const groups = day ?
  //     [ this.entries.filter( { userId, day } ) ] :
  //     Object.values( this.entries.filter( { userId } ).groupBy( 'day' ) );
  //   for ( const group of groups ) {
  //     const totalDuration = group.reduce( (a,c) => a + c.duration, 0 )
  //     group.forEach( entry => entry.assign({ _dailyTotalDuration : totalDuration }))
  //   }
  // }
  
  public async getEntries( options?:EntryFilterOptions ) {
    if ( ! options )
      return this.entries.value() as Entry[];

    const { userId, from, to, limit } = options
    let entries = ( !userId ? this.entries : this.entries.filter( { userId } ) ).value()
    if ( from ) 
      entries = entries.filter( o => o.day >= from )
    if ( to )
      entries = entries.filter( o => o.day <= to )
    if ( limit && entries.length > limit )
      entries.length = limit

    return entries.sort( (a,b) => b.day - a.day ) as Entry[];
  }

  public async getEntryById( id:string ) {
    return this.entries.find( { id } ).value() as Entry|undefined;
  }

  public async addEntry( userId:string , day:number , duration:number , notes:string ) {
    const user = this.users.find( { id : userId } ).value();
    if ( ! user )
      throw new ApiError( "User does not exist", 404 );
    
    const id = this.genuuid()
    const entry = { id, userId, day, duration, notes }
    validate( validation.entry, entry )

    await this.entries.splice( 0, 0, entry ).write()
    await this.updateEntryTotals( entry.userId, day );

    return await this.getEntryById( id )
  }

  public async updateEntry( id:string, updates:EntryUpdates ) {
    validate( validation.entry_updates, updates )

    await this.entries.find( { id } ).assign( updates ).write()

    const entry = await this.getEntryById( id )
    await this.updateEntryTotals( entry!.userId );
    return entry
  }

  public async deleteEntry( id:string ) {
    const entry = await this.getEntryById( id )
    if ( ! entry )
      throw new ApiError( "Entry does not exist", 404 );
      
    await this.entries.remove( { id } ).write();
    await this.updateEntryTotals( entry.userId, entry.day );
    await this.database?.write()
  }

  //#endregion

  //// INITIALIZATION ////

  public async initialize( databaseFilePath:string ) {
    this.database = await low( new FileAsync( databaseFilePath ) )
    this.database.defaultsDeep( { users : [], entries : [] } ).write()
  }
}

export default new DataManager()