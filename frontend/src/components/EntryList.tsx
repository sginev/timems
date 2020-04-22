import React from 'react'

import { FaTimesCircle as IconDelete } from 'react-icons/fa';
import { Entry, daysToMilliseconds } from '../services/entry';

const EntryListComponent:React.FC<{ list:Entry[] }> = ({ list }) => {
  return (
    <div className="entry-list">
      { list.map( o => <EntryListItemComponent key={ o.id } entry={ o } /> ) }
    </div>
  )
}

export default EntryListComponent

const EntryListItemComponent:React.FC<{ entry:Entry }> = ({ entry }) => {
  const Content = () => {
    const date = new Date( daysToMilliseconds( entry.day ) ).toLocaleDateString()
    const duration = (+entry.duration).toFixed( 2 )
    const description = entry.notes
    
    return ( <>
      <div className="date"> { date } </div>
      <div className="duration"> { duration } </div>
      <div className="notes"> { description } ({ entry.day })</div>
      <div className="delete"> <IconDelete/> </div>
    </> )
  }

  return (
    <div className="entry-list-item">
      { entry && <Content /> }
    </div>
  )
}
