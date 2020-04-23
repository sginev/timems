import React from 'react'

import { FaTimesCircle as IconDelete } from 'react-icons/fa';
import { Entry, daysToMilliseconds } from '../services/entry';
import dateformat from 'dateformat'

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
  const Content = () => {
    const date = dateformat( new Date( daysToMilliseconds( entry.day ) ), `yyyy.mm.dd` )
    const duration = entry.duration + 'h'
    const description = entry.notes

    return ( <>
      <div className="date"> { date } </div>
      <div className="duration"> { duration } </div>
      <div className="notes"> { description } </div>
      <div className="delete"> <IconDelete/> </div>
    </> )
  }

  return (
    <div className="entry-list-item">
      { entry && <Content /> }
    </div>
  )
}
