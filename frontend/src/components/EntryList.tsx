import React from 'react'

import { FaTimesCircle as IconDelete, FaPen as IconEdit } from 'react-icons/fa';
import { Entry, daysToMilliseconds } from '../services/entry';
import dateformat from 'dateformat'
import { MyUserContext } from '../services/user';
import { AccessControl } from 'shared/authorization/AccessControl';

type SharedProps = { showUsername:boolean, colorize:boolean, onClickEdit:(entry:Entry)=>void };
type ItemProps = { entry?:Entry } & SharedProps;
type ListProps = { list:Entry[], size:number } & SharedProps;

const EntryListItemComponent = ({ entry, showUsername, colorize, onClickEdit }:ItemProps) => {
  const myUser = React.useContext( MyUserContext )!;
  const color = ( !colorize || !entry || !myUser.preferredWorkingHoursPerDay ) ? '' :
  entry._dailyTotalDuration! < myUser.preferredWorkingHoursPerDay ? 'prefUnmet' : 'prefMet';
  
  const access = new AccessControl( myUser );
  const canEdit = myUser.id === entry?.userId ?
                  access.update.own.entry :
                  access.update.any.entry;
  
  if ( entry ) {
    const renderEditButtons = () => (
      <div className="buttons">
        <div className="edit" onClick={ () => onClickEdit!( entry! ) }> <IconEdit/> </div>
        {/* <div className="delete"> <IconDelete/> </div> */}
      </div>
    )
    
    const date = dateformat( new Date( daysToMilliseconds( entry.day ) ), `yyyy.mm.dd` )
    const duration = entry.duration < 1 ? 
                     ~~( entry.duration * 60 ) + 'min' : 
                     (''+entry.duration).substr(0,4) + 'h'
    const description = entry.notes
    return (
      <div className={`entry-list-item ${ color }`}>
        <div className="date"> { date } </div>
        { showUsername && <div className="username"> { entry._username } </div> }
        <div className="duration"> { duration } </div>
        <div className="notes"> { description }</div>
        {/* <div className=""> ({ entry._dailyTotalDuration })</div> */}
        { canEdit && !!onClickEdit && renderEditButtons() }
      </div>
    )
  } else {
    return (
      <div className={`entry-list-item empty`}>
        { showUsername && <div className="username"></div> }
        <div className="date"> &#8203; </div>
        <div className="duration"> </div>
        <div className="notes"> </div>
      </div>
    )
  }
}

const EntryListComponent = ({ list, size, showUsername, colorize, onClickEdit }:ListProps) => {
  const items = new Array( size ).fill( 0 ).map( (_,i) => list[i] || undefined )
  return (
    <div className="entry-list">
      <div className="entry-list-item entry-list-header">
        <div className="date"> Date </div>
        { showUsername && <div className="username"> User </div> }
        <div className="duration"> Time </div>
        <div className="notes"> Notes </div>
      </div>
      { items.map( ( entry, i ) => <EntryListItemComponent 
        { ...{ key:i, entry, showUsername, colorize, onClickEdit } } /> ) }
    </div>
  )
}

export default EntryListComponent
