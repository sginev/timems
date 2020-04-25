import mongoose from 'mongoose'
import faker from 'faker'
import dotenv from "dotenv";
dotenv.config();

import User from "../src/models/User"
import Entry, { IEntry } from "../src/models/Entry"
import { encryptPassword } from '../src/util/passwords';
import data from '../src/datamanager';

import configuration from './seed.conifg'

const { DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_AUTHDB } = process.env;

mongoose.set( 'useCreateIndex', true );

main().catch( e => {
  console.error( `\x1b[31m${ e }\x1b[0m` )
  process.exit( e.code || 500 );
} );

async function main() {
  console.log(`Connecting to database ${ DATABASE_URL }`);
  
  const dbUri = `${DATABASE_URL}?authSource=${DATABASE_AUTHDB}`
  const dbOptions:mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: {
     user: DATABASE_USERNAME!,
     password: DATABASE_PASSWORD!,
    },
  }
  await mongoose.connect( dbUri, dbOptions );

  await User.remove({});
  await Entry.remove({});

  console.log(`Seeding said database...`);

  for ( const u of configuration.users ) {
    const countUsers = parseInt( faker.fake( u.repeat ) )
    for ( let iu = 0 ; iu < countUsers ; iu++ ) {
      const userData = {
        username: faker.fake(u.username),
        passhash: encryptPassword( faker.fake( u.password ) ),
        role: u.role
      };
      const newUser = await new User( userData ).save();
      console.log( `User: ${ newUser.username } (${ newUser.role })` )

      const entries:IEntry[] = []
      for ( const e of u.entries ) {
        const countEntries = parseInt( faker.fake( e.repeat ) )
        for ( let ie = 0 ; ie < countEntries ; ie++ ) {
          const entryData = {
            userId: newUser.id,
            day: parseInt( faker.fake(e.day) ),
            duration: parseFloat( faker.fake(e.duration) ),
            notes: faker.fake( e.notes ),
            _username: newUser.username,
          };
          entries.push( new Entry(entryData) );
          console.log( `- ${ entryData.notes } ${ entryData.day }/${ entryData.duration }` )
        }
      }
      await Entry.insertMany( entries )
      
      await data.entries.updateDailyTotals( newUser.id )
      
      console.log( `<< Total daily durations updated >>` )
      console.log()
    }
  }

  process.exit();
}