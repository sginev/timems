import Joi from '@hapi/joi';
import { UserRole } from '../interfaces/UserRole';

const roles = [ UserRole.Admin, UserRole.UserManager, UserRole.Member, UserRole.Locked ]

class Validator {
  public static readonly Auth = Joi.object({
    username: Joi.string().alphanum().min(4).max(40).required(),
    password: Joi.string().min(4).max(80).required(),
  })
  public static readonly AuthFormLogin = Validator.Auth;
  public static readonly AuthFormRegister = Validator.Auth.keys({
    passwordConfirmation: Joi.any().valid(Joi.ref('password')).required()
      //@ts-ignore
      .error( () => new Joi.ValidationError('Passwords must match'))
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

  constructor ( private readonly onValidationFailure?:( error:Joi.ValidationError ) => void ) {}

  public readonly validate = <T>( joi:Joi.ObjectSchema<T>, target:T ) => {
    const { error, value } = joi.validate( target );
    if ( error && this.onValidationFailure ) {
      this.onValidationFailure( error )
    }
    return { error, value }
  } 
}

export default Validator;