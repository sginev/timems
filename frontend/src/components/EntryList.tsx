import React, { useState } from 'react'

import { FaTimesCircle as IconDelete } from 'react-icons/fa';
import Pagination from 'react-bootstrap/Pagination';
import DatePicker from "react-datepicker";

import user from '../services/user'

import "react-datepicker/dist/react-datepicker.css";
import { NavLink } from 'react-router-dom';

export interface Entry
{
  id : string
  userId : string
  duration : number
  day : number
  notes : string[]
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

      <div className="setting-note">
        <span className="label"> 
          (Preferred working hours per day: <b>{ user.workHoursPerDay }</b>) 
        </span>
        <NavLink className="sneaky" exact to="/my-user"><b>change</b></NavLink>
      </div>

      { props.list.map( o => <EntryListItemComponent key={ o.id } entry={ o } /> ) }
      
      <Pagination>{items}</Pagination>
    </div>
  )
}

const daysToMilliseconds = days => ( days * 1000 * 60 * 60 * 24 )

function EntryListItemComponent( props:{ entry:Entry }) {
  const date = new Date( daysToMilliseconds( props.entry.day ) )
  const duration = props.entry.duration + ":00"
  return (
    <div className="entry-list-item">
      <div className="date"> { date.toLocaleDateString() } </div>
      <div className="duration"> { duration } </div>
      <div className="notes"> { props.entry.id } </div>
      <div className="delete"> <IconDelete/> </div>
    </div>
  )
}