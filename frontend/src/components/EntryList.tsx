import React from 'react'

import { FaTimesCircle as IconDelete } from 'react-icons/fa';
import { Entry, daysToMilliseconds } from '../services/entry';
import dateformat from 'dateformat'
import { MyUserContext } from '../services/user';

const EntryListComponent:React.FC<{ list:Entry[] }> = ({ list }) => {
  return (
    <div className="entry-list">
      <div className="entry-list-item entry-list-header">
        <div className="date"> Date </div>
        <div className="duration"> Time </div>
        <div className="notes"> Notes </div>
      </div>
      { list.map( o => <EntryListItemComponent key={ o.id } entry={ o } /> ) }
    </div>
  )
}

export default EntryListComponent

const EntryListItemComponent:React.FC<{ entry:Entry }> = ({ entry }) => {
  const myUser = React.useContext( MyUserContext )!;
  const date = dateformat( new Date( daysToMilliseconds( entry.day ) ), `yyyy.mm.dd` )
  const duration = entry.duration < 1 ? entry.duration * 60 + 'min' : entry.duration + 'h'
  const description = entry.notes
  const color = ! myUser.preferredWorkingHoursPerDay ? '' :
    entry._dailyTotalDuration! < myUser.preferredWorkingHoursPerDay ? 'prefUnmet' : 'prefMet';

  
  const Content = () => {
    return ( <>
      <div className="date"> { date } </div>
      <div className="duration"> { duration } </div>
      <div className="notes"> { description } ({ entry._dailyTotalDuration })</div>
      <div className="delete"> <IconDelete/> </div>
    </> )
  }

  return (
    <div className={`entry-list-item ${ color }`}>
      { entry && <Content /> }
    </div>
  )
}
