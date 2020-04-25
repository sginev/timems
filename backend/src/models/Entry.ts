import Mongoose from 'mongoose';
import MongoosePaginate from 'mongoose-paginate-v2';
import { IUser } from './User';

export interface IEntry extends Mongoose.Document
{
  userId: IUser['_id']
  day : number
  duration : number
  notes : string
  _dailyTotalDuration? : number
}

const EntrySchema = new Mongoose.Schema({
  userId: { type: Mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { 
    type: Number, 
    min: 0,
    validate : {
      validator : Number.isInteger,
      message   : '{VALUE} is not an integer value'
    },
    required: true 
  },
  duration: { 
    type: Number, 
    min: 0,
    max: 24,
    required: true 
  },
  notes: { 
    type: String, 
    trim: true, 
    required: false
  },
  _dailyTotalDuration: { 
    type: Number, 
    min: 0,   
    // max: 24,  
    // ^ 
    // Better to allow users to make mistakes 
    // with their total duration, for smoother ux
    required: false
  },
  _username: { type: String, required: true }
});

EntrySchema.virtual('id').get( _id => _id );

EntrySchema.set('toJSON', { 
  virtuals: true,
  versionKey:false,
  transform: (_, ret) => { delete ret._id }
});

EntrySchema.plugin( MongoosePaginate );

export default Mongoose.model<IEntry>('Entry', EntrySchema) as Mongoose.Model<IEntry>&Mongoose.PaginateModel<IEntry>;