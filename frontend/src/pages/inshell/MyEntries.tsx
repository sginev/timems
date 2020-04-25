import React, { useState } from 'react'

import { NavLink } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { FaSyncAlt as IconRefresh } from "react-icons/fa";

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import EntryListComponent from '../../components/EntryList'
import EntryFilterComponent, { FilterState } from '../../components/EntryFilter';
import { useApiDataLoader } from '../../utils/react';
import { millisecondsToDays, Entry } from '../../services/entry';
import { MyUserContext, User } from '../../services/user';
import PaginationComponent from '../../components/Pagination';
import EntryEditorModalComponent from '../../components/EntryEditor';

export default function MyEntriesPage() 
{
  const myUser = React.useContext( MyUserContext ) as User;
  const defaultFilterState = { startDate : null, endDate : null };
  const [ filterState, setFilterState ] = useState<FilterState>( defaultFilterState );
  const canEdit = true;
  const limit = 10
  const path = `/entries`;
  const defaultData = { entries : new Array<Entry>(), totalPages : 1, page : 1 };
  const [ { data, loading }, load ] = useApiDataLoader( path, defaultData, { userId: myUser.id, limit } );

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
    load( { from, to, limit, page, userId : myUser.id }, data );
  }

  const [editorModalState, setEditorModalState] = useState<any>({});
  const onClickEdit = canEdit && ( ( entry:Entry ) => {
    setEditorModalState({ show:true, entry })
  } )

  const list = data.entries
  const showUsername = false

  return (
    <div>

      <PageContentHeaderComponent title="My work records">
        {/* <Button variant="outline-secondary" onClick={ () => reloadData() }> <IconRefresh /> </Button> */}
        <Button variant="primary" onClick={ () => setEditorModalState({ show:true }) }>
          Add new record
        </Button>
      </PageContentHeaderComponent>

      { loading && <div className="progress-line" /> }

      <PageContentBodyComponent>
        <EntryFilterComponent state={ filterState } setState={ onFilterChange } />
        <SettingsNoteComponent />
        <EntryListComponent {...{ list, size:limit, showUsername, onClickEdit } } />
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
