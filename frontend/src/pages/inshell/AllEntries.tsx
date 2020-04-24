import React, { useState } from 'react'

import Button from 'react-bootstrap/Button';

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import ErrorBodyComponent from '../../components/ErrorBody';
import EntryListComponent from '../../components/EntryList'
import EntryFilterComponent, { FilterState } from '../../components/EntryFilter';
import { useApiDataLoader } from '../../utils/react';
import { millisecondsToDays, Entry } from '../../services/entry';
import PaginationComponent from '../../components/Pagination';
import EntryEditorModalComponent from '../../components/EntryEditor';

export default function AllEntriesPage() 
{
  const defaultFilterState = { startDate : null, endDate : null };
  const [ filterState, setFilterState ] = useState<FilterState>( defaultFilterState );
  var [ page, setPage ] = useState( 1 );
  const canEdit = true;
  const limit = 10
  const path = `/entries`;
  const defaultData = { entries : new Array<Entry>(), pages : 1 };
  const [ { data, loading, error }, load ] = useApiDataLoader( path, defaultData, { limit } );

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
    load( { from, to, limit, page : pg }, data );
  }

  const renderBody = () => {
    if ( error )
      return <ErrorBodyComponent error={ error } />
    return <EntryListComponent list={ data.entries } size={ limit } onClickEdit={ canEdit && onClickEdit } />
  }

  const [editorModalState, setEditorModalState] = useState<any>({});
  const onClickEdit = ( entry:Entry ) => {
    setEditorModalState({ show:true, entry })
  }

  return (
    <div>

      <PageContentHeaderComponent title="All users' work records" />

      { loading && <div className="progress-line" /> }

      <PageContentBodyComponent>
        <EntryFilterComponent state={ filterState } setState={ onFilterChange } />
        { renderBody() }
        <PaginationComponent currentPage={ page } lastPage={ data.pages } onAction={ onPageSelect }/>
      </PageContentBodyComponent>

      { editorModalState.show &&
        <EntryEditorModalComponent 
          state={ editorModalState } 
          changeState={ setEditorModalState } 
          refresh={ () => reloadData() } />
      }

    </div>
  )
}