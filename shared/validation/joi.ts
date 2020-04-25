import Joi from '@hapi/joi';
import { UserRole } from '../interfaces/UserRole';

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

export default validation;