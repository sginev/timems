import React, { useState } from 'react';
import { useToasts } from 'react-toast-notifications';

import api from "../../services/api";
import hooks from "../../utils/hooks";

import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Container from 'react-bootstrap/Container';

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import EntryListComponent from '../../components/EntryList';
import EntryFilterComponent, { FilterState } from '../../components/EntryFilter';
import { useApiDataLoader, useRefreshOnFocus } from '../../utils/react';
import { millisecondsToDays, Entry } from '../../utils/entry';
import { MyUserContext } from '../../utils/user';
import PaginationComponent from '../../components/Pagination';
import EntryEditorModalComponent from '../../components/EntryEditor';
import MinimumDailyHoursSliderComponent, { minimumDailyHoursToText } from '../../components/WorkHoursSlider';

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

  useRefreshOnFocus( error ? undefined : reloadData );

  //// Preferred minimum daily hours slider

  const { addToast } = useToasts();
  const [ minDailyHours, setMinDailyHours ] = useState( myUser.preferredWorkingHoursPerDay || 0 );

  const onChangeMinimumDailyHoursLive = ( value:number ) => {
    setMinDailyHours( value );
  }
  const onChangeMinimumDailyHoursDone = async ( value:number ) => {
    setMinDailyHours( value )
    console.log( "DONE!", value );
    const preferredWorkingHoursPerDay = value;
    try {
      await api.request( '/users/' + myUser.id, "post", { preferredWorkingHoursPerDay } );
      hooks.setMyUserData( { ...myUser, preferredWorkingHoursPerDay } );
    } catch ( e ) {
      setMinDailyHours( myUser.preferredWorkingHoursPerDay || 0 );
      addToast( e.message, { appearance : "error" } )
    }
  }

  ////

  return (
    <>

      <PageContentHeaderComponent title="My work records">
        <Button variant="secondary" onClick={ () => setEditorModalState({ show:true }) }>
          Add new record
        </Button>
      </PageContentHeaderComponent>

      { loading && <div className="progress-line" /> }

      <PageContentBodyComponent>
        <EntryFilterComponent state={ filterState } setState={ onFilterChange } />

        {/* <MinimumDailyHoursSlider /> */}
        
        <Accordion className="foldable-settings">
          <Accordion.Toggle as={Container} eventKey="0" className="toggler-area">
            <span className="label"> 
              Preferred working hours per day: <b>{ minimumDailyHoursToText( minDailyHours ) }</b>
            </span>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="0" className="content-area">
            <MinimumDailyHoursSliderComponent 
              onChangeLive={ onChangeMinimumDailyHoursLive }
              onChangeDone={ onChangeMinimumDailyHoursDone }
              value={ minDailyHours } />
          </Accordion.Collapse>
        </Accordion>


        <EntryListComponent {...{ list, size:limit, showUsername, minDailyHours, onClickEdit } } />
        <PaginationComponent {...{ currentPage:data.page, lastPage: data.totalPages, onAction:onPageSelect } } />

        <div className="page-component-foot-filler" ></div>
        
      </PageContentBodyComponent>

      { editorModalState.show &&
        <EntryEditorModalComponent 
          state={ editorModalState } 
          changeState={ setEditorModalState } 
          refresh={ () => reloadData() } />
      }

    </>
  )
}