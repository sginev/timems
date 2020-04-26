import Joi from '@hapi/joi';
import { UserRole } from '../interfaces/UserRole';

const roles = [ UserRole.Admin, UserRole.UserManager, UserRole.Member, UserRole.Locked ]

const common = {
  user : {
    username: Joi.string().regex( /^[a-zA-Z0-9-_]+$/ ).min(4).max(40),
    password: Joi.string().min(4).max(80),
    role: Joi.number().integer().valid( ...roles ),
    preferredWorkingHoursPerDay: Joi.number().min(0).max(24),
  },
  entry : {
    userId: Joi.string(),
    day: Joi.number().integer().min(0),
    duration: Joi.number(),
    notes: Joi.string(),
  }
}

class Validator {
  public static readonly Auth = Joi.object({
    username : common.user.username.required(),
    password : common.user.password.required(),
  })
  public static readonly AuthFormLogin = Validator.Auth;
  public static readonly AuthFormRegister = Validator.Auth.keys({
    passwordConfirmation: Joi.any().valid(Joi.ref('password')).required()
      //@ts-ignore
      .error( () => new Joi.ValidationError('Passwords must match'))
  })

  public static readonly ApiUserCreate = Joi.object({
    username : common.user.username.required(),
    password : common.user.password.required(),
    role : common.user.role,
    preferredWorkingHoursPerDay : common.user.preferredWorkingHoursPerDay,
  })

  public static readonly ApiUserUpdate = Joi.object({
    username : common.user.username,
    password : common.user.password,
    role : common.user.role,
    preferredWorkingHoursPerDay : common.user.preferredWorkingHoursPerDay,
  })

  public static readonly ApiEntryCreate = Joi.object({
    userId: common.entry.userId.required(),
    day: common.entry.day.required(),
    duration: common.entry.duration.required(),
    notes: common.entry.notes,
  })

  public static readonly ApiEntryUpdate = Joi.object({
    userId: common.entry.userId,
    day: common.entry.day,
    duration: common.entry.duration,
    notes: common.entry.notes,
  })

  public static readonly UserModel = Joi.object({
    username: Joi.string().alphanum().min(4).max(40).required(),
    role: Joi.number().integer().valid( ...roles ).required(),
    preferredWorkingHoursPerDay: Joi.number().min(0).max(24),
  })
  public static readonly UserUpdates = Joi.object({
    username: Joi.string().alphanum().min(4).max(40),
    password: Joi.string().min(4).max(80),
    role: Joi.number().integer().valid( ...roles ),
    preferredWorkingHoursPerDay: Joi.number().min(0).max(24),
  })
  public static readonly EntryModel = Joi.object({
    id: Joi.string(),
    userId: Joi.string().required(),
    day: Joi.number().integer().min(0).required(),
    duration: Joi.number().required(),
    notes: Joi.string().required(),
    _username: Joi.string().required(),
  })
  public static readonly EntryUpdates = Joi.object({
    userId: Joi.string(),
    day: Joi.number().integer().min(0),
    duration: Joi.number(),
    notes: Joi.string(),
  })
}

export default Validator;