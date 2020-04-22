import React, { useState, useReducer } from 'react'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { DateRangeInput, FocusedInput, OnDatesChangeProps } from "@datepicker-react/styled";
import { ThemeProvider } from "styled-components";

const dateRangeInputTheme = {
  breakpoints: ["32em", "48em", "64em"],
  reactDatepicker: {
    daySize: [36, 40],
    fontFamily: "system-ui, -apple-system",
    colors: {
      // graci: '#223344',
      // white: '#112233',
      accessibility: "#D80249",
      selectedDay: "#f7518b",
      selectedDayHover: "#F75D95",
      primaryColor: "#d8366f"
    }
  }
}

type Action = { type:string, payload:any }
export type FilterState = { startDate:Date|null, endDate:Date|null };

function entryFilterReducer( state:OnDatesChangeProps, action:Action ) {
  switch (action.type) {
    case "focusChange":
      return { ...state, focusedInput: action.payload };
    case "dateChange":
      return action.payload;
    default:
      throw new Error();
  }
}

const EntryFilterComponent:React.FC<{state:FilterState,setState:React.Dispatch<FilterState>}> = 
({ state, setState }) => {
  const [ reducerState, setReducerState ] = useReducer( entryFilterReducer, { ...state, focusedInput: null } );
  return (
    <div className="filter-bar">
      <ThemeProvider theme={ dateRangeInputTheme } >
        <DateRangeInput
          onDatesChange={ data => {
              setReducerState({ type: "dateChange", payload: data })
            }
          }
          onFocusChange={ focusedInput => {
              setReducerState({ type: "focusChange", payload: focusedInput })
              if ( focusedInput === null )
                setState( reducerState )
            }
          }
          startDate={ reducerState.startDate } // Date or null
          endDate={ reducerState.endDate } // Date or null
          focusedInput={ reducerState.focusedInput } // START_DATE, END_DATE or null
        />
      </ThemeProvider>
    </div>
  );
}

// export default EntryFilterComponent

///// OLD VERSION

const EntryFilterComponent_OLD:React.FC<{state:FilterState,setState:React.Dispatch<FilterState>}> = 
({ state, setState }) => {
  return (
    <div className="filter-bar">
      <div>
        <span className="label">From: </span>
        <DatePicker 
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