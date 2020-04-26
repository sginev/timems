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
    duration: Joi.number().min(0).max(24),
    notes: Joi.string(),
    _dailyTotalDuration: Joi.number().min(0),
    _username: Joi.string().required(),
  }
}

const validation = {
  api : {
    auth : Joi.object({
      username : common.user.username.required(),
      password : common.user.password.required(),
    }),
    user : {
      create : Joi.object({
        username : common.user.username.required(),
        password : common.user.password.required(),
        role : common.user.role,
        preferredWorkingHoursPerDay : common.user.preferredWorkingHoursPerDay,
      }),
      update : Joi.object({
        username : common.user.username,
        password : common.user.password,
        role : common.user.role,
        preferredWorkingHoursPerDay : common.user.preferredWorkingHoursPerDay,
      }),
    },
    entry : {
      create : Joi.object({
        userId: common.entry.userId.required(),
        day: common.entry.day.required(),
        duration: common.entry.duration.required(),
        notes: common.entry.notes,
      }),
      update : Joi.object({
        userId: common.entry.userId,
        day: common.entry.day,
        duration: common.entry.duration,
        notes: common.entry.notes,
      }),
    }
  },
  form : {
    auth : {
      login : Joi.object({
        username : common.user.username.required(),
        password : common.user.password.required(),
      }),
      register : Joi.object({
        username : common.user.username.required(),
        password : common.user.password.required(),
        passwordConfirmation: Joi.any().valid(Joi.ref('password')).required()
                              //@ts-ignore
                              .error( () => new Joi.ValidationError('Passwords must match'))
      }),
    }
  },
  model : {
    user : {
      username : common.user.username.required(),
      password : common.user.password.required(),
      role : common.user.role.required(),
      preferredWorkingHoursPerDay : common.user.preferredWorkingHoursPerDay,
    },
    entry : {
      userId: common.entry.userId.required(),
      day: common.entry.day.required(),
      duration: common.entry.duration.required(),
      notes: common.entry.notes.required(),
      _username: common.entry._username.required(),
      _dailyTotalDuration: common.entry._dailyTotalDuration,
    },
  },
}

export default validation;