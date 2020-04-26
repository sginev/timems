import React from 'react'

import { Day, daysToMilliseconds } from '../utils/entry';
import dateformat from 'dateformat'

type SharedProps = { minDailyHours?:number };
type ItemProps = { day?:Day } & SharedProps;
type ListProps = { list:Day[], size:number } & SharedProps;

const DayListItemComponent = ({ day, minDailyHours }:ItemProps) => {
  const color = ( !minDailyHours || !day ) ? '' : 
                day.totalDuration! < minDailyHours ? 'prefUnmet' : 'prefMet';
  if ( day ) {
    const date = dateformat( new Date( daysToMilliseconds( day.day ) ), `yyyy.mm.dd` )
    const duration = day.totalDuration < 1 ? 
                     ~~( day.totalDuration * 60 ) + 'min' : 
                     (''+day.totalDuration).substr(0,4) + 'h'
    const description = day.notes.join( ", " );
    return (
      <div className={`entry-list-item ${ color }`}>
        <div className="date"> { date } </div>
        <div className="duration"> { duration } </div>
        <div className="notes"> { description }</div>
      </div>
    )
  } else {
    return (
      <div className={`entry-list-item empty`}>
        <div className="date"> &#8203; </div>
        <div className="duration"> </div>
        <div className="notes"> </div>
      </div>
    )
  }
}

const DayListComponent = ({ list, size, minDailyHours }:ListProps) => {
  const items = new Array( size ).fill( 0 ).map( (_,i) => list[i] || undefined )
  return (
    <div className="entry-list">
      <div className="entry-list-item entry-list-header">
        <div className="date"> Date </div>
        <div className="duration"> Time </div>
        <div className="notes"> Notes </div>
      </div>
      { items.map( ( day, i ) => <DayListItemComponent 
        { ...{ key:i, day, minDailyHours } } /> ) }
    </div>
  )
}

export default DayListComponent
