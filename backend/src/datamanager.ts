import * as uuid from 'uuid';

import { User, UserRole, Entry } from "./models";

// import { Db } from 'mongodb';
// import { getDatabase } from './util/mongo';
// import Loki from 'lokijs';
// var db = new Loki('DATABASS')
// var users = db.addCollection('users');
// var entries = db.addCollection('entries');

import low from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';
import { encryptPassword } from './util/passwords';

interface DBData {
  users : User[]
  entries : Entry[]
}

export class DataManager 
{
  private millisecondsToDays = ms => ~~( ms / ( 1000 * 60 * 60 * 24 ) )
  private genuuid = uuid.v4;

  private database?:low.LowdbAsync<DBData>
  private get users() { return this.database!.get( 'users', [] ) }
  private get entries() { return this.database!.get( 'entries', [] ) }

  //// USER ////

  public async getUsers() {
    return this.users.value();
  }
  public async getUserById( id:string ) {
    return this.users.find( { id } ).value()
  }
  public async getUserByUsername( username:string ) {
    return this.users.find( { username } ).value()
  }
  public async addUser( username:string, password:string, role:UserRole ) {
    const id = this.genuuid()
    const passhash = encryptPassword( password )
    const settings = { preferredWorkingHoursPerDay : 0 }
    const user = { id, username, passhash, role, settings }
    const results = await this.users.push( user ).write()
    return results[ 0 ]
  }
  public async updateUser( id:string, updates:{ username?:string, password?:string, role?:UserRole } ) {
    const results = this.users.find( { id } ).assign( updates ).write()
    return results[ 0 ]
  }
  public async deleteUser( id:string ) {
    const results = await this.users.remove( { id } ).write()
    return results[ 0 ]
  }

  //// ENTRY ////
  
  public async getEntries() {
    return this.entries.value();
  }
  public async getEntry( id:string ) {
    return this.entries.find( { id } ).value()
  }
  public async addEntry( userId:string , day:number , duration:number , notes:string[] ) {
    const id = this.genuuid()
    const entry = { id, userId, day, duration, notes }
    const results = await this.entries.push( entry ).write()
    return results[ 0 ]
  }
  public async updateEntry( id:string, updates:{ date:number, duration:number, notes:string[] } ) {
    const results = this.entries.find( { id } ).assign( updates ).write()
    return results[ 0 ]
  }
  public async deleteEntry( id:string ) {
    const results = await this.entries.remove( { id } ).write()
    return results[ 0 ]
  }

  //// INITIALIZATION ////

  public async initialize() {
    this.database = await low( new FileAsync( `./temp/database.json` ) )
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