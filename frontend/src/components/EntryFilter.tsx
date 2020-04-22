import React, { useState } from 'react'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface EntryFilterData {
  from:number
  to:number
}

export default function EntryFilterComponent( props:EntryFilterData ) {
  const [ startDate, setStartDate ] = useState( new Date() );
  const [ endDate, setEndDate ] = useState( new Date() );
  return (
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
  )
}