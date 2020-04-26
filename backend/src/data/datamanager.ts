import Mongoose from 'mongoose';

import { encryptPassword, comparePassword } from './util/passwords';
import { UserRole } from 'shared/interfaces/UserRole';
import User, { IUser } from "./models/User";
import Entry, { IEntry } from "./models/Entry";
import validation from 'shared/validation/Validator';
import { assertValidated, assert, assertFound } from '../api/util/assertions';

type UserUpdates = { username?:string, password?:string, role?:UserRole, preferredWorkingHoursPerDay?:number }
type EntryUpdates = { day:number, duration:number, notes:string }
type EntryFilterOptions = { userId?:string, from?:number, to?:number, limit?:number, page?:number }

const users = {
  getAll: async function () {
    return await User.find();
  } ,

  getPaginated: async function ({ limit=12, page=1 }) {
    const temp = await User.paginate( {}, { limit, page } );
    return {
      users : temp.docs,
      totalPages : temp.totalPages,
      page : temp.page,
    }
  },
  
  getById: async function ( id:string ) {
    return await User.findById( id );
  } ,

  getByUsername: async function ( username:string ) {
    return await User.findOne({ username });
  } ,

  add: async function ( username:string, password:string, role:UserRole ) {
    assert( ! await this.getByUsername( username ), "Chosen username is already taken.", 409 );
    const data = { 
      username, role, 
      passhash : encryptPassword( password ),
      preferredWorkingHoursPerDay : 0
    };
    assertValidated( validation.model.user.create.validate( data ) );
    const newUser = await new User( data ).save();
    return newUser;
  } ,

  update: async function ( id:string, updates:UserUpdates ) {
    for ( const key in updates )
      if ( updates[key] === undefined )
        delete updates[key];

    if ( updates.username ) {
      const user = await this.getByUsername( updates.username );
      assert( ! user || user.id == id, "Chosen username is already taken.", 409 );
    }

    if ( updates.password ) {
      updates['passhash'] = encryptPassword( updates.password );
      delete updates.password;
    }

    assertValidated( validation.model.user.update.validate( updates ) );

    const user = await User.findByIdAndUpdate( id, updates, {new: true} );
    
    if ( user && updates.username ) {
      await entries.updateUsernames( user.id, user.username );
    }

    return user;
  } ,

  delete: async function ( id:string ) {
    await User.findByIdAndDelete( id );
    await Entry.deleteMany({ userId : id });
  } ,

  checkCredentials: async function ( username:string, password:string ) {
    const user = await User.findOne({ username }).select('+passhash').exec();
    assert( !! user, `No user with username '${ username }' found.`, 401 );
    assert( comparePassword( password, user!.passhash ), `Wrong password!`, 401 );
    return await User.findOne({ username });
  } ,
}

const entries = {
  getPaginated: async function ( options?:EntryFilterOptions ) {
    const DEFAULT_LIMIT = 10;
    const { userId, from, to, limit, page } = { limit : DEFAULT_LIMIT, page :1, ...options }

    assert( ! userId || !! await User.findById( userId ), "User does not exist", 400 );

    const conditions:any = {};
    if ( from && to ) conditions.day = { $lte: to, $gte: from };
    else if ( from ) conditions.day = { $gte: from };
    else if ( to ) conditions.day = { $lte: to };
    if ( userId ) conditions.userId = userId;

    const temp = await Entry.paginate( conditions , { limit, page, sort:'-day' } )
    return {
      entries : temp.docs,
      totalPages : temp.totalPages,
      page : temp.page,
    }
  },

  getById: async function ( id:string ) {
    return await Entry.findById( id ).exec();
  },

  add: async function ( userId:string , day:number , duration:number , notes:string ) {
    const user = await users.getById( userId ) as IUser;
    assert( !! user, "User does not exist", 400 );
    const entryData = { userId, day, duration, notes, _username: user.username };
    const entry = await new Entry(entryData).save();
    await this.updateDailyTotals( entry.userId, entry.day );
  },

  update: async function ( id:string, updates:EntryUpdates ) {
    for ( const key in updates )
      if ( updates[key] === undefined )
        delete updates[key]
    const entry = await this.getById( id ) as IEntry;
    assertFound( entry, `Entry` );
    const updatedEntry = await Entry.findByIdAndUpdate( id, updates );
    if ( updatedEntry && updatedEntry.day !== entry.day )
      await this.updateDailyTotals( entry.userId, updatedEntry.day );
    await this.updateDailyTotals( entry.userId, entry.day );
    return await this.getById( id );
  },

  delete: async function ( id:string ) {
    const entry = await this.getById( id ) as IEntry;
    assertFound( entry, `Entry` );
    await Entry.findByIdAndDelete( id );
    await this.updateDailyTotals( entry.userId, entry.day );
  },

  updateDailyTotals: async function ( owner:string, day?:number ) {
    const userId = Mongoose.Types.ObjectId( owner );
    const aggregations:any[] = [
      { $match: day ? { userId, day } : { userId } },
      { $group: { _id: "$day", _dailyTotalDuration: { $sum: "$duration" } } },
    ];
  
    const groups = await Entry.aggregate( aggregations );
    for ( const { _id:day, _dailyTotalDuration } of groups ) {
      await Entry.updateMany( { userId, day }, { $set : { _dailyTotalDuration } } );
    }
  },

  updateUsernames: async function ( userId:string, _username:string ) {
    await Entry.updateMany( { userId }, { $set : { _username } } );
  },
}

const days = {
  getAll: async function ( userId?:string ) {
    const aggregations:any[] = [
      { $group: { 
        _id: "$day",
        day: { $first: "$day" },
        totalDuration: { $sum: "$duration" },
        notes: { $push: "$notes" },
        entriesCount: { $sum: 1 },
      } },
      { $unset: ["_id"] }
    ]
    
    if ( userId )
      aggregations.splice( 0, 0, { $match: { userId : Mongoose.Types.ObjectId( userId ) } } );

    const days = await Entry.aggregate( aggregations );

    return { days };
  },
}

export default { users, entries, days }