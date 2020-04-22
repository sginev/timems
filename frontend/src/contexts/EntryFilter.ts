import React from 'react';

interface EntryFilterData {
  from?:number
  to?:number
}

export const EntryFilterContext = React.createContext<EntryFilterData>( {} );