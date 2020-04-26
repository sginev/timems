import express from 'express';
import { IUser } from '../models/User';
import { AccessControl } from "shared/authorization/AccessControl";

export default interface Response extends express.Response { 
  locals: { 
    caller: IUser
    access: AccessControl 
    data: any
  }
}
