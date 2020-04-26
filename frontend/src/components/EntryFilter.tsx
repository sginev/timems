import React from 'react'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export type FilterState = { startDate:Date|null, endDate:Date|null };

const EntryFilterComponent_OLD:React.FC<{state:FilterState,setState:React.Dispatch<FilterState>}> = 
({ state, setState }) => {
  return (
    <div className="filter-bar">
      <div>
        <span className="label">From: </span>
        <DatePicker 
          dropdownMode='scroll'
          placeholderText="Anytime"
          selected={ state.startDate } 
          onChange={ startDate => {
            if ( startDate ) {
              if ( state.endDate && state.endDate < startDate ) {
                state.endDate = startDate
              }
              setState({ ...state, startDate })
            }
          } } />
      </div>
      <div>
        <span className="label">To: </span>
        <DatePicker 
          placeholderText="Anytime"
          selected={ state.endDate } 
          onChange={ endDate => {
            if ( endDate ) {
              if ( state.startDate && state.startDate > endDate ) {
                state.startDate = endDate
              }
              setState({ ...state, endDate })
            }
          } } />
      </div>
    </div>
  )
}

export default EntryFilterComponent_OLD