import React from 'react'

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import ErrorBodyComponent from '../../components/ErrorBody';
import UserListComponent from '../../components/UserList';
import useApiLoader from '../../utils/react';

export default function AllUsers()
{
  const { data, loading, error } = useApiLoader( "/users", { users : [] } )
  const items = data.users

  const renderBody = () => {
    if ( error )
      return <ErrorBodyComponent error={ error } />
    if ( ! loading )
      return <UserListComponent list={ items } />;
  }

  return (
    <div>
      <PageContentHeaderComponent title="Time management users" />
      { loading && <div className="progress-line"></div> }
      <PageContentBodyComponent>
        { renderBody() }
      </PageContentBodyComponent>
    </div>
  )
}