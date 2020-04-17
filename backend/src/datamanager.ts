import crypto from 'crypto';
import * as uuid from 'uuid';

import JsonDB from "./util/jsondb";
import { User, Entry, UserRole } from "./models";

interface DBData {
  users : User[]
  entries : Entry[]
}

const database = new JsonDB<DBData>('./temp/database.json')
const encryptPassword = raw => 
  crypto.createHash('md5').update( raw ).digest("hex");

const genuuid = uuid.v4

export class DataManager 
{
  private get users() { return database.data.users }
  private get entries() { return database.data.entries }
  private get data() { return database.data }

  //// USER ////

  public async getUsers() {
    return this.data.users
  }
  public async getUserById( id:string ) {
    return this.data.users.find( u => u.id == id )
  }
  public async getUserByUsername( username:string ) {
    return this.data.users.find( u => u.username == username )
  }
  public async addUser( username:string, password:string, role:UserRole ) {
    const id = genuuid()
    const passhash = encryptPassword( password )
    const settings = { preferredWorkingHoursPerDay : 0 }
    const user = { id, username, passhash, role, settings }
    this.data.users.push( user )
    return user
  }
  public async updateUser( id:string, updates:{ username?:string, password?:string, role?:UserRole } ) {
    const user = this.data.users.find( u => u.id == id )
    if ( user ) {
      for ( let key in updates ) {
        user[ key ] = updates[ key ]
      }
    }
  }
  public async deleteUser( username:string ) {
    const userIndex = this.data.users.findIndex( u => u.username == username )
    this.data.users.splice( userIndex, 1 )
  }

  //// ENTRY ////
  
  public async getEntries() {
    return this.data.entries
  }
  public async getEntry( id:string ) {
    return this.data.entries.find( o => o.id == id )
  }
  public async addEntry( userId:string , date:number , duration:number , notes:string[] ) {
    const id = genuuid()
    this.data.entries.push( { id, userId, date, duration, notes } )
  }
  public async updateEntry( id:string, updates:{ date:number, duration:number, notes:string[] } ) {
    const user = this.data.entries.find( u => u.id == id )
    if ( user ) {
      for ( let key in updates ) {
        user[ key ] = updates[ key ]
      }
    }
  }
  public async deleteEntry( id:string ) {
    const userIndex = this.data.entries.findIndex( o => o.id == id )
    this.data.entries.splice( userIndex, 1 )
  }

  //// INITIALIZATION ////

  public async initialize() {

    await database.initialize()

    if ( ! database.data.users ) {
      database.data.users = []
      await this.addUser( `admin`, `toptal`, UserRole.Admin )
      await this.addUser( `manager`, `toptal-man`, UserRole.UserManager )
      await this.addUser( `user-red`, `ffoooo`, UserRole.Member )
      await this.addUser( `user-green`, `ooffoo`, UserRole.Member )
      await this.addUser( `user-blue`, `ooooff`, UserRole.Member )
    }

    if ( ! database.data.entries ) {
      database.data.entries = []
      const userId = ( await this.getUserByUsername( `user-blue` ) )!.id
      for ( let i = 0 ; i < 4 ; i++ ) {
        await this.addEntry( 
          userId, 
          ~~( new Date().getTime() - Math.random() * 1000000 ),
          ~~( 1 + Math.random() * 23 ),
          [ `entry #` + i, `(mock)` ] )
      }
    }

    // console.log( db.data )
  }
}