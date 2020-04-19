import { UserRole } from '../src/models';

const millisecondsToDays = ms => ~~( ms / ( 1000 * 60 * 60 * 24 ) )

export async function populateData( data ) {
  if ( ! (await data.getUsers()).length ) {
    await data.addUser( `admin`, `toptal`, UserRole.Admin )
    await data.addUser( `manager`, `toptal`, UserRole.UserManager )
    await data.addUser( `huey`, `toptal`, UserRole.Member )
    await data.addUser( `dewey`, `toptal`, UserRole.Member )
    await data.addUser( `louie`, `toptal`, UserRole.Member )
  }

  if ( ! (await data.getEntries()).length ) {
    const jobs = [
      {
        username : `huey`,
        days : _ => millisecondsToDays( new Date().getTime() ) - ~~( Math.random() * 365 ),
        duration : _ => ~~( 1 + Math.random() * 23 ),
        notes : i => [ `entry #` + i, `(mock)` ] ,
        count : 123
      } ,
      {
        username : `dewey`,
        days : _ => millisecondsToDays( new Date().getTime() ) - ~~( Math.random() * 365 ),
        duration : _ => ~~( 1 + Math.random() * 23 ),
        notes : i => [ `entry #` + i, `(mock)` ] ,
        count : 31
      } ,
      {
        username : `louie`,
        days : _ => millisecondsToDays( new Date().getTime() ) - ~~( Math.random() * 365 ),
        duration : _ => ~~( 1 + Math.random() * 23 ),
        notes : i => [ `entry #` + i, `(mock)` ] ,
        count : 17
      } ,
    ]
    for ( const o of jobs ) {
      const userId = ( await data.getUserByUsername( o.username ) )!.id
      for ( let i = 0 ; i < o.count ; i++ ) {
        await data.addEntry( userId, o.days( i ), o.duration( i ), o.notes( i ) )
      }
    }
  }
}