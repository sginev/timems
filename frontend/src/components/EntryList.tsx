import React from 'react'

import { FaTimesCircle as IconDelete, FaPen as IconEdit } from 'react-icons/fa';
import { Entry, daysToMilliseconds } from '../services/entry';
import dateformat from 'dateformat'
import { MyUserContext } from '../services/user';

const EntryListItemComponent = ({ entry, onClickEdit }:{ entry:Entry, onClickEdit:(entry:Entry)=>void }) => {
  const myUser = React.useContext( MyUserContext )!;
  const color = ! entry || ! myUser.preferredWorkingHoursPerDay ? '' :
    entry._dailyTotalDuration! < myUser.preferredWorkingHoursPerDay ? 'prefUnmet' : 'prefMet';

  const renderEditButtons = () => (
    <div className="buttons">
      <div className="edit" onClick={ () => onClickEdit( entry ) }> <IconEdit/> </div>
      {/* <div className="delete"> <IconDelete/> </div> */}
    </div>
  )
  
  if ( entry ) {
    const date = dateformat( new Date( daysToMilliseconds( entry.day ) ), `yyyy.mm.dd` )
    const duration = entry.duration < 1 ? 
                     ~~( entry.duration * 60 ) + 'min' : 
                     (''+entry.duration).substr(0,4) + 'h'
    const description = entry.notes
    return (
      <div className={`entry-list-item ${ color }`}>
        <div className="date"> { date } </div>
        <div className="duration"> { duration } </div>
        <div className="notes"> { description }</div>
        {/* <div className=""> ({ entry._dailyTotalDuration })</div> */}
        { onClickEdit && renderEditButtons() }
      </div>
    )
  } else {
    return (
      <div className={`entry-list-item empty`}>
        <div className="date"> &#8203; </div>
        <div className="duration"> </div>
        <div className="notes"> </div>
        <div className="delete"> </div>
      </div>
    )
  }
}

const EntryListComponent = ({ list, size, onClickEdit }:{ list:Entry[], size:number, onClickEdit:(entry:Entry)=>void }) => {
  const items = new Array( size ).fill( 0 )
  return (
    <div className="entry-list">
      <div className="entry-list-item entry-list-header">
        <div className="date"> Date </div>
        <div className="duration"> Time </div>
        <div className="notes"> Notes </div>
      </div>
      { items.map( ( _, i ) => <EntryListItemComponent key={ i } entry={ list[ i ] } onClickEdit={ onClickEdit } /> ) }
    </div>
  )
}

export default EntryListComponent
