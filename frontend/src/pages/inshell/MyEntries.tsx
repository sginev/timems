import React, { useState } from 'react'

import { NavLink } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import EntryListComponent from '../../components/EntryList'
import EntryFilterComponent, { FilterState } from '../../components/EntryFilter';
import { useApiDataLoader, useRefreshOnFocus } from '../../utils/react';
import { millisecondsToDays, Entry } from '../../utils/entry';
import { MyUserContext, User } from '../../utils/user';
import PaginationComponent from '../../components/Pagination';
import EntryEditorModalComponent from '../../components/EntryEditor';

import { PAGE_SIZE_OWN_ENTRIES } from '../../Configuration';

export default function MyEntriesPage() 
{
  const myUser = React.useContext( MyUserContext )!;
  const defaultFilterState = { startDate : null, endDate : null };
  const [ filterState, setFilterState ] = useState<FilterState>( defaultFilterState );
  const limit = PAGE_SIZE_OWN_ENTRIES
  const path = `/entries`;
  const defaultData = { entries : new Array<Entry>(), totalPages : 1, page : 1 };
  const [ { data, loading, error }, load ] = useApiDataLoader( path, defaultData, { userId: myUser.id, limit } );

  data.page = data.page || 1;
  data.totalPages = data.entries.length && ( data.totalPages || 1 );

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
    load( { from, to, limit, page, userId : myUser.id }, data );
  }

  const [editorModalState, setEditorModalState] = useState<any>({});
  const onClickEdit = ( entry:Entry ) => {
    setEditorModalState({ show:true, entry })
  }

  const list = data.entries
  const showUsername = false
  const colorize = true

  useRefreshOnFocus( error ? undefined : reloadData );

  return (
    <div>

      <PageContentHeaderComponent title="My work records">
        <Button variant="primary" onClick={ () => setEditorModalState({ show:true }) }>
          Add new record
        </Button>
      </PageContentHeaderComponent>

      { loading && <div className="progress-line" /> }

      <PageContentBodyComponent>
        <EntryFilterComponent state={ filterState } setState={ onFilterChange } />
        <SettingsNoteComponent />
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
