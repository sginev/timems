import React, { useState } from 'react'

import { NavLink } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import ErrorBodyComponent from '../../components/ErrorBody';
import EntryListComponent from '../../components/EntryList'
import EntryFilterComponent, { FilterState } from '../../components/EntryFilter';
import { useApiDataLoader } from '../../utils/react';
import { millisecondsToDays, Entry } from '../../services/entry';
import { MyUserContext, User } from '../../services/user';
import PaginationComponent from '../../components/Pagination';

export default function MyEntriesPage() 
{
  const myUser = React.useContext( MyUserContext ) as User;
  const defaultFilterState = { startDate : null, endDate : null };
  const [ filterState, setFilterState ] = useState<FilterState>( defaultFilterState );
  var [ page, setPage ] = useState( 1 );

  const limit = 10
  const path = `/entries`;
  const defaultData = { entries : new Array<Entry>(), pages : 1 };
  const [ { data, loading, error }, load ] = useApiDataLoader( path, defaultData, { userId: myUser.id, limit } );
  //// todo: trust current page from api

  if ( page > data.pages )
    page = data.pages

  const onFilterChange = ( state:FilterState ) => {
    setFilterState( state );
    reloadData( state );
  }

  const onPageSelect = ( page:number ) => {
    setPage( page )
    reloadData( filterState, page );
  }

  const reloadData = ( state:FilterState = filterState, pg = page ) => {
    const from = state.startDate ? millisecondsToDays( state.startDate.getTime() ) : undefined;
    const to = state.endDate ? millisecondsToDays( state.endDate.getTime() ) : undefined;
    load( { from, to, limit, page : pg, userId : myUser.id }, data );
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
        <PaginationComponent currentPage={ page } lastPage={ data.pages } onAction={ onPageSelect }/>
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
