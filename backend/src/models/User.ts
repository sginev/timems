import Mongoose from 'mongoose';

import { UserRole } from 'shared/interfaces/UserRole';

export interface IUser extends Mongoose.Document {
  username : string
  passhash : string
  preferredWorkingHoursPerDay? : number
  role : UserRole
}

const UserSchema = new Mongoose.Schema({
  username: { 
    type: String, 
    trim: true, 
    required: true, 
    unique: true 
  },
  passhash: { type: String, select: false, required: true },
  preferredWorkingHoursPerDay: { 
    type: Number, 
    min: 0,
    max: 24,
    required: false 
  },
  role: {
    type: Number,
    enum: [UserRole.Admin,UserRole.UserManager,UserRole.Member,UserRole.Locked],
    required: [true, 'No user role provided']
  }
});

UserSchema.virtual('id').get( _id => _id );

UserSchema.set('toJSON', { 
  virtuals: true,
  versionKey:false,
  transform: (_, ret) => { delete ret._id }
});

export default Mongoose.model<IUser>('User', UserSchema);