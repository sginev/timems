import { UserRole } from 'shared/interfaces/UserRole';
import Joi from '@hapi/joi';

// const Joi = require( '@hapi/joi' );

const MAX_PAGE_SIZE = 500

const roles = [ UserRole.Admin, UserRole.UserManager, UserRole.Member, UserRole.Locked ];

const common = {
  user : {
    username: Joi.string().regex( /^[a-zA-Z0-9-_\.]+$/ ).min(4).max(40),
    password: Joi.string().min(4).max(80),
    role: Joi.number().integer().valid( ...roles ),
    preferredWorkingHoursPerDay: Joi.number().min(0).max(24),
    passhash: Joi.string().min(1),
  },
  entry : {
    userId: Joi.string(),
    day: Joi.number().integer().min(0),
    duration: Joi.number().min(0).max(24),
    notes: Joi.string(),
    _dailyTotalDuration: Joi.number().min(0),
    _username: Joi.string().required(),
  },
  paginate : Joi.object({
    limit: Joi.number().min(1).max( MAX_PAGE_SIZE ),
    page: Joi.number().min(1),
  }),
}

const validation = {
  api : {
    auth : Joi.object({
      username : common.user.username.required(),
      password : common.user.password.required(),
    }),
    user : {
      list : common.paginate,
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
      list : common.paginate.append({
        userId : common.entry.userId,
        from : Joi.number().integer().min(0),
        to : Joi.number().integer().min(0),
      }),
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
    },
    day : {
      list : common.paginate.append({
        userId : common.entry.userId,
        from : Joi.number().integer().min(0),
        to : Joi.number().integer().min(0),
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
                              .error( () => new ValidationError('Passwords must match'))
      }),
    }
  },
  model : {
    user : {
      create : Joi.object({
        username : common.user.username.required(),
        passhash : common.user.passhash.required(),
        role : common.user.role.required(),
        preferredWorkingHoursPerDay : common.user.preferredWorkingHoursPerDay,
      }),
      update : Joi.object({
        username : common.user.username,
        passhash : common.user.passhash,
        role : common.user.role,
        preferredWorkingHoursPerDay : common.user.preferredWorkingHoursPerDay,
      }),
    },
  },
}

class ValidationError extends Error {}

export default validation;