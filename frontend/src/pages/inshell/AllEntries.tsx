import React, { useState } from 'react'

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
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
  const canEdit = true;
  const limit = 10
  const path = `/entries`;
  const defaultData = { entries : new Array<Entry>(), totalPages : 1, page : 1 };
  const [ { data, loading }, load ] = useApiDataLoader( path, defaultData, { limit } );

  data.page = data.page || 1;
  data.totalPages = data.totalPages || 1;

  const onFilterChange = ( state:FilterState ) => {
    setFilterState( state );
    reloadData( state );
  }

  const onPageSelect = ( page:number ) => {
    reloadData( filterState, page );
  }

  const reloadData = ( state:FilterState = filterState, page = data.page ) => {
    const from = state.startDate ? millisecondsToDays( state.startDate.getTime() ) : undefined;
    const to = state.endDate ? millisecondsToDays( state.endDate.getTime() ) : undefined;
    load( { from, to, limit, page }, data );
  }

  const [editorModalState, setEditorModalState] = useState<any>({});
  const onClickEdit = canEdit && ( ( entry:Entry ) => {
    setEditorModalState({ show:true, entry })
  } )

  const list = data.entries
  const showUsername = true
  const colorize = false

  return (
    <div>

      <PageContentHeaderComponent title="All users' work records" />

      { loading && <div className="progress-line" /> }

      <PageContentBodyComponent>
        <EntryFilterComponent state={ filterState } setState={ onFilterChange } />
        <EntryListComponent {...{ list, size:limit, showUsername, colorize, onClickEdit } } />
        <PaginationComponent {...{ currentPage:data.page, lastPage: data.totalPages, onAction:onPageSelect } } />
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