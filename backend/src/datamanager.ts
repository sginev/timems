import Mongoose from 'mongoose';
import Joi from '@hapi/joi';

import ApiError from './api-errors';
import { encryptPassword, comparePassword } from './util/passwords';
// import { User, UserRole, Entry } from "./models";

import User, { IUser, UserRole } from "./models/User";
import Entry, { IEntry } from "./models/Entry";

type UserUpdates = { username?:string, password?:string, role?:UserRole, preferredWorkingHoursPerDay?:number }
type EntryUpdates = { day:number, duration:number, notes:string }
type EntryFilterOptions = { userId?:string, from?:number, to?:number, limit?:number, page?:number }

const roles = [ UserRole.Admin, UserRole.UserManager, UserRole.Member, UserRole.Locked ]
const validation = {
  user : Joi.object({
    username: Joi.string().alphanum().min(4).max(40).required(),
    password: Joi.string().min(4).max(80).required(),
    role: Joi.number().integer().valid( ...roles ).required(),
    preferredWorkingHoursPerDay: Joi.number().min(0).max(24),
  }),
  user_updates : Joi.object({
    username: Joi.string().alphanum().min(4).max(40),
    password: Joi.string().min(4).max(80),
    role: Joi.number().integer().valid( ...roles ),
    preferredWorkingHoursPerDay: Joi.number().min(0).max(24),
  }),
  entry : Joi.object({
    id: Joi.string(),
    userId: Joi.string().required(),
    day: Joi.number().integer().min(0).required(),
    duration: Joi.number().required(),
    notes: Joi.string().required(),
    _username: Joi.string().required(),
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

const users = {
  getAll: async function () {
    return await User.find();
  } ,

  getById: async function ( id:string ) {
    return await User.findById( id );
  } ,

  getByUsername: async function ( username:string ) {
    return await User.findOne({ username });
  } ,

  add: async function ( username:string, password:string, role:UserRole ) {
    if ( await this.getByUsername( username ) )
      throw new ApiError( "Chosen username is already taken.", 409 );

    validate( validation.user, { username, password, role } )

    const passhash = encryptPassword( password );
    const preferredWorkingHoursPerDay = 0;

    const newUser = await new User({ 
      username, passhash, role, preferredWorkingHoursPerDay }).save();

    return newUser;
  } ,

  update: async function ( id:string, updates:UserUpdates ) {
    for ( const key in updates )
      if ( updates[key] === undefined )
        delete updates[key]

    if ( updates.username ) {
      const user = await this.getByUsername( updates.username );
      if ( user && user.id !== id )
        throw new ApiError( "Chosen username is already taken.", 409 );
    }

    validate( validation.user_updates, updates )
  
    if ( updates.password ) {
      updates['passhash'] = encryptPassword( updates.password );
      delete updates.password;
    }

    console.log( updates )
    
    const user = await User.findByIdAndUpdate( id, updates, {new: true} );
    
    if ( user && updates.username ) {
      await entries.updateUsernames( user.id, user.username )
    }

    return user;
  } ,

  delete: async function ( id:string ) {
    await User.findByIdAndDelete( id )
    await Entry.deleteMany({ userId : id })
  } ,

  checkCredentials: async function ( username:string, password:string ) {
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
  
  getPaginated: async function ( options?:EntryFilterOptions ) {
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
      pages : temp.totalPages,
    }
  },

  getById: async function ( id:string ) {
    return await Entry.findById( id ).exec()
  },

  add: async function ( userId:string , day:number , duration:number , notes:string ) {
    const user = await users.getById( userId );
    if ( ! user )
      throw new ApiError( "User does not exist", 404 );
    
    const entryData = { userId, day, duration, notes, _username: user.username };
    validate( validation.entry, entryData );
    const entry = await new Entry(entryData).save();
    await this.updateDailyTotals( entry.userId, entry.day );
  },

  update: async function ( id:string, updates:EntryUpdates ) {
    for ( const key in updates )
      if ( updates[key] === undefined )
        delete updates[key]

    validate( validation.entry_updates, updates )
    const entry = await this.getById( id );
    if ( !entry ) 
      throw new ApiError( `Entry not found.`, 404 );
    const updatedEntry = await Entry.findByIdAndUpdate( id, updates );
    if ( updatedEntry && updatedEntry.day !== entry.day )
      await this.updateDailyTotals( entry.userId, updatedEntry.day );
    await this.updateDailyTotals( entry.userId, entry.day );
  },

  delete: async function ( id:string ) {
    const entry = await this.getById( id );
    if ( !entry ) 
      throw new ApiError( `Entry not found.`, 404 );
    await Entry.findByIdAndDelete( id );
    await this.updateDailyTotals( entry.userId, entry.day );
  },
}

export default { users, entries }