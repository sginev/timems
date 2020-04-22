import React from 'react'

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import ErrorBodyComponent from '../../components/ErrorBody';
import EntryListComponent from '../../components/EntryList'
import Button from 'react-bootstrap/Button';

import { useApiLoader } from '../../utils/react';
import { MyUserContext, User } from '../../services/user';

export default function MyEntriesPage() 
{
  const myUser = React.useContext( MyUserContext ) as User;
  
  const path = `/users/${ myUser.id }/entries`
  const { data, loading, error } = useApiLoader( path, { entries : [] } )
  const items = data.entries

  const renderBody = () => {
    if ( error )
      return <ErrorBodyComponent error={ error } />
    if ( ! loading )
      return <EntryListComponent list={ items } />;
  }

  return (
    <div>
      <PageContentHeaderComponent title="My work records">
        <Button variant="primary">
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