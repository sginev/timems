import React, { useState } from 'react'

import { FaTimesCircle as IconDelete } from 'react-icons/fa';
import Pagination from 'react-bootstrap/Pagination';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { NavLink } from 'react-router-dom';
import { MyUserContext, User } from '../services/user';

export interface Entry
{
  id : string
  userId : string
  duration : number
  day : number
  notes : string
}

let active = 2;
let items:any[] = [];
for ( let number = 1; number <= 10; number++ ) {
  items.push(
    <Pagination.Item key={ number } active={ number === active }>
      { number }
    </Pagination.Item>
  );
}

function SettingsNoteComponent() {
  const myUser = React.useContext( MyUserContext ) as User;
  if ( ! myUser.preferredWorkingHoursPerDay )
    return null
  return (
    <div className="setting-note">
      <span className="label"> 
        (Preferred working hours per day: <b>{ myUser.preferredWorkingHoursPerDay }</b>) 
      </span>
      <NavLink className="sneaky" exact to="/my-user"><b>change</b></NavLink>
    </div>
  )
}

export default function EntryListComponent( props:{ list:Entry[] } ) {
  const [ startDate, setStartDate ] = useState( new Date() );
  const [ endDate, setEndDate ] = useState( new Date() );
  return (
    <div className="entry-list">
      
      <div className="filter-bar">
        <div>
          <span className="label">From: </span>
          <DatePicker selected={ startDate } onChange={ date => date && setStartDate(date) } />
        </div>
        <div>
          <span className="label">To: </span>
          <DatePicker selected={ endDate } onChange={ date => date && setEndDate(date) } />
        </div>
      </div>

      <SettingsNoteComponent/>

      { props.list.map( o => <EntryListItemComponent key={ o.id } entry={ o } /> ) }
      
      <Pagination>{items}</Pagination>

    </div>
  )
}

// private millisecondsToDays = ms => ~~( ms / ( 1000 * 60 * 60 * 24 ) )
const daysToMilliseconds = days => ( days * 1000 * 60 * 60 * 24 )

const EntryListItemComponent:React.FC<{ entry:Entry }> = ({ entry }) => {
  const Content = () => {
    const date = new Date( daysToMilliseconds( entry.day ) ).toLocaleDateString()
    const duration = (+entry.duration).toFixed( 2 )
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
