import React, { useState } from 'react'

import { NavLink } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import ErrorBodyComponent from '../../components/ErrorBody';
import EntryListComponent from '../../components/EntryList'
import EntryFilterComponent, { FilterState } from '../../components/EntryFilter';
import { useApiDataLoader } from '../../utils/react';
import { millisecondsToDays } from '../../services/entry';
import { MyUserContext, User } from '../../services/user';
import PaginationComponent from '../../components/Pagination';

export default function MyEntriesPage() 
{
  const myUser = React.useContext( MyUserContext ) as User;
  const defaultFilterState = { startDate : null, endDate : null };
  const [ filterState, setFilterState ] = useState<FilterState>( defaultFilterState );

  const limit = 20
  const path = `/entries`;
  const [ { data, loading, error }, load ] = useApiDataLoader( path, { entries : [] }, { userId: myUser.id, limit } );

  const onFilterChange = ( state:FilterState ) => {
    setFilterState( state );
    reloadData( state );
  }

  const reloadData = ( state:FilterState = filterState ) => {
    const from = state.startDate ? millisecondsToDays( state.startDate.getTime() ) : undefined;
    const to = state.endDate ? millisecondsToDays( state.endDate.getTime() ) : undefined;
    load( { from, to, limit, userId : myUser.id }, data );
  }

  const renderBody = () => {
    if ( error )
      return <ErrorBodyComponent error={ error } />
    return <EntryListComponent list={ data.entries } size={ limit } />
  }

  return (
    <div>

      <PageContentHeaderComponent title="My work records">
        <Button variant="primary" onClick={ () => reloadData() }>
          Add new record
        </Button>
      </PageContentHeaderComponent>

      { loading && <div className="progress-line"></div> }

      <PageContentBodyComponent>
        <EntryFilterComponent state={ filterState } setState={ onFilterChange } />
        <SettingsNoteComponent />
        { renderBody() }
        <PaginationComponent />
      </PageContentBodyComponent>
      
    </div>
  )
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
