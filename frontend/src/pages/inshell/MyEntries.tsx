import React from 'react'

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import ErrorBodyComponent from '../../components/ErrorBody';
import EntryListComponent from '../../components/EntryList';
import Button from 'react-bootstrap/Button';

import { useApiDataLoader } from '../../utils/react';
import { MyUserContext, User } from '../../services/user';
import { NavLink } from 'react-router-dom';

export default function MyEntriesPage() 
{
  const myUser = React.useContext( MyUserContext ) as User;
  const path = `/users/${ myUser.id }/entries` // + (Math.random()>.5?'_broken':'')
  const [ { data, loading, error }, reload ] = useApiDataLoader( path, { entries : [] } )
  const items = data.entries
  // items.length = 1 + ~~( Math.random() * 8 )

  const renderBody = () => {
    if ( error )
      return <ErrorBodyComponent error={ error } />
    if ( ! loading )
      return <EntryListComponent list={ items } />;
  }

  return (
    <div>
      <PageContentHeaderComponent title="My work records">
        <Button variant="primary"
          onClick={ () => reload( data ) }>
          Add new record
        </Button>
      </PageContentHeaderComponent>
      { loading && <div className="progress-line"></div> }
      <PageContentBodyComponent>
        { renderBody() }
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
