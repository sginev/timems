import React, { useState } from 'react'

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import ErrorBodyComponent from '../../components/ErrorBody';
import EntryListComponent from '../../components/EntryList'
import EntryFilterComponent, { FilterState } from '../../components/EntryFilter';
import { useApiDataLoader } from '../../utils/react';
import { millisecondsToDays, Entry } from '../../services/entry';
import Button from 'react-bootstrap/Button';

export default function AllEntriesPage() 
{
  const defaultFilterState = { startDate : null, endDate : new Date() };
  const [ filterState, setFilterState ] = useState<FilterState>( defaultFilterState );
  const canEdit = true
  const limit = 10
  const path = `/entries`;
  const [ { data, loading, error }, load ] = useApiDataLoader( path, { entries : [] }, { limit } );

  const onFilterChange = ( state:FilterState ) => {
    setFilterState( state );
    const from = state.startDate && millisecondsToDays( state.startDate.getTime() );
    const to = state.endDate && millisecondsToDays( state.endDate.getTime() );
    load( { from, to, limit }, data );
  }

  const onClickEdit = ( entry:Entry ) => {
  }

  const renderBody = () => {
    if ( error )
      return <ErrorBodyComponent error={ error } />
    if ( ! loading ) 
      return <EntryListComponent list={ data.entries } size={ limit } onClickEdit={ onClickEdit } />
  }

  return (
    <div>

      <PageContentHeaderComponent title="All users' work records">
        <Button variant="primary"
          onClick={ () => load( data ) }>
          Add new record
        </Button>
      </PageContentHeaderComponent>

      { loading && <div className="progress-line"></div> }

      <PageContentBodyComponent>
        <EntryFilterComponent state={ filterState } setState={ onFilterChange } />
        { renderBody() }
      </PageContentBodyComponent>
      
    </div>
  )
}