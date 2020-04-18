import * as uuid from 'uuid';
import low from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';

import ApiError from './api-errors';
import { encryptPassword, comparePassword } from './util/passwords';
import { User, UserRole, Entry } from "./models";

const DATABASE_FILEPATH = `./temp/db2.json`;

interface DBData {
  users : User[]
  entries : Entry[]
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
    const id = this.genuuid()
    const passhash = encryptPassword( password )
    const settings = { preferredWorkingHoursPerDay : 0 }
    const user = { id, username, passhash, role, settings }
    const results = await this.users.push( user ).write()
    // delete results[ 0 ]['passhash']
    return results[ 0 ]
  }
  public async updateUser( id:string, updates:{ username?:string, password?:string, role?:UserRole } ) {
    if ( ! this.users.find( { id } ).value() )
      throw new ApiError( "User does not exist", 404 )
    if ( updates.password ) {
      updates['passhash'] = encryptPassword( updates.password )
      delete updates.password
    }
    const results = await this.users.find( { id } ).assign( updates ).write()
    // delete results['passhash']
    return results
  }
  public async deleteUser( id:string ) {
    const results = await this.users.remove( { id } ).write()
    // delete results[ 0 ]['passhash']
    return results[ 0 ]
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
  public async getEntry( id:string ) {
    return this.entries.find( { id } ).value() as Entry|undefined;
  }
  public async addEntry( userId:string , day:number , duration:number , notes:string[] ) {
    const id = this.genuuid()
    const entry = { id, userId, day, duration, notes }
    const results = await this.entries.push( entry ).write()
    return results[ 0 ]
  }
  public async updateEntry( id:string, updates:{ day:number, duration:number, notes:string[] } ) {
    const results = this.entries.find( { id } ).assign( updates ).write()
    return results[ 0 ]
  }
  public async deleteEntry( id:string ) {
    const results = await this.entries.remove( { id } ).write()
    return results[ 0 ]
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
      const userId = ( await this.getUserByUsername( `user-blue` ) )!.id
      for ( let i = 0 ; i < 4 ; i++ ) {
        await this.addEntry( 
          userId, 
          this.millisecondsToDays( new Date().getTime() ) - ~~( Math.random() * 365 ),
          ~~( 1 + Math.random() * 23 ),
          [ `entry #` + i, `(mock)` ] )
      }
    }
  }
}

export default new DataManager()