import Mongoose from 'mongoose';

import ApiError from './types/ApiError';
import { encryptPassword, comparePassword } from './util/passwords';
import { UserRole } from 'shared/interfaces/UserRole';
import User from "./models/User";
import Entry from "./models/Entry";
import validation from 'shared/validation/Validator';

type UserUpdates = { username?:string, password?:string, role?:UserRole, preferredWorkingHoursPerDay?:number }
type EntryUpdates = { day:number, duration:number, notes:string }
type EntryFilterOptions = { userId?:string, from?:number, to?:number, limit?:number, page?:number }

const validate = ( joi:any, target:any ) => {
  const { error } = joi.validate( target );
  if ( error )
    throw error;
}

const users = {
  getAll: async function () 
  {
    return await User.find();
  } ,

  getPaginated: async function ({ limit=12, page=1 }) 
  {
    const temp = await User.paginate( {}, { limit, page } )
    return {
      users : temp.docs,
      totalPages : temp.totalPages,
      page : temp.page,
    }
  },
  
  getById: async function ( id:string ) 
  {
    return await User.findById( id );
  } ,

  getByUsername: async function ( username:string ) 
  {
    return await User.findOne({ username });
  } ,

  add: async function ( username:string, password:string, role:UserRole ) 
  {
    if ( await this.getByUsername( username ) )
      throw new ApiError( "Chosen username is already taken.", 409 );

    // validate( Validator.UserModel, { username, password, role } )

    const passhash = encryptPassword( password );
    const preferredWorkingHoursPerDay = 0;

    const newUser = await new User({ 
      username, passhash, role, preferredWorkingHoursPerDay }).save();

    return newUser;
  } ,

  update: async function ( id:string, updates:UserUpdates ) 
  {
    for ( const key in updates )
      if ( updates[key] === undefined )
        delete updates[key]

    if ( updates.username ) 
    {
      const user = await this.getByUsername( updates.username );
      if ( user && user.id !== id )
        throw new ApiError( "Chosen username is already taken.", 409 );
    }

    // validate( Validator.UserUpdates, updates )
  
    if ( updates.password ) 
    {
      updates['passhash'] = encryptPassword( updates.password );
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate( id, updates, {new: true} );
    
    if ( user && updates.username ) {
      await entries.updateUsernames( user.id, user.username )
    }

    return user;
  } ,

  delete: async function ( id:string ) 
  {
    await User.findByIdAndDelete( id )
    await Entry.deleteMany({ userId : id })
  } ,

  checkCredentials: async function ( username:string, password:string ) 
  {
    const user = await User.findOne({ username }).select('+passhash').exec()
    if ( ! user ) 
      throw new ApiError( `No user with username '${ username }' found.`, 401 )
    if ( ! comparePassword( password, user.passhash ) ) 
      throw new ApiError( `Wrong password!`, 401 )
    return await User.findOne({ username })
  } ,
}

const entries = {
  updateDailyTotals: async function ( owner:string, day?:number ) 
  {
    const userId = Mongoose.Types.ObjectId( owner )
    const aggregations:any[] = [
      { $match: day ? { userId, day } : { userId } },
      { $group: { _id: "$day", _dailyTotalDuration: { $sum: "$duration" } } },
    ];
  
    const groups = await Entry.aggregate( aggregations )
    for ( const { _id:day, _dailyTotalDuration } of groups ) {
      await Entry.updateMany( { userId, day }, { $set : { _dailyTotalDuration } } )
    }
  },

  updateUsernames: async function ( userId:string, _username:string ) 
  {
    await Entry.updateMany( { userId }, { $set : { _username } } )
  },
  
  getPaginated: async function ( options?:EntryFilterOptions ) 
  {
    const DEFAULT_LIMIT = 10
    const { userId, from, to, limit, page } = { limit : DEFAULT_LIMIT, page :1, ...options }

    if ( userId && ! await User.findById( userId ) )
      throw new ApiError( "User does not exist", 400 );

    const conditions:any = {}
    if ( from && to ) conditions.day = { $lte: to, $gte: from }
    else if ( from ) conditions.day = { $gte: from }
    else if ( to ) conditions.day = { $lte: to }
    if ( userId ) conditions.userId = userId
    // return await Entry.paginate( conditions , { limit, page, sort:'-day' } )

    const temp = await Entry.paginate( conditions , { limit, page, sort:'-day' } )
    return {
      entries : temp.docs,
      totalPages : temp.totalPages,
      page : temp.page,
    }
  },

  getById: async function ( id:string ) 
  {
    return await Entry.findById( id ).exec()
  },

  add: async function ( userId:string , day:number , duration:number , notes:string ) 
  {
    const user = await users.getById( userId );
    if ( ! user )
      throw new ApiError( "User does not exist", 404 );
    
    const entryData = { userId, day, duration, notes, _username: user.username };

    // validate( Validator.EntryModel, entryData );

    const entry = await new Entry(entryData).save();
    await this.updateDailyTotals( entry.userId, entry.day );
  },

  update: async function ( id:string, updates:EntryUpdates ) 
  {
    for ( const key in updates )
      if ( updates[key] === undefined )
        delete updates[key]

    // validate( Validator.EntryUpdates, updates )
    const entry = await this.getById( id );
    if ( !entry ) 
      throw new ApiError( `Entry not found.`, 404 );
    const updatedEntry = await Entry.findByIdAndUpdate( id, updates );
    if ( updatedEntry && updatedEntry.day !== entry.day )
      await this.updateDailyTotals( entry.userId, updatedEntry.day );
    await this.updateDailyTotals( entry.userId, entry.day );
    return await this.getById( id );
  },

  delete: async function ( id:string ) 
  {
    const entry = await this.getById( id );
    if ( !entry ) 
      throw new ApiError( `Entry not found.`, 404 );
    await Entry.findByIdAndDelete( id );
    await this.updateDailyTotals( entry.userId, entry.day );
  },
}

export default { users, entries }