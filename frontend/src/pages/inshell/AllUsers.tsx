import React from 'react'

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import ErrorBodyComponent from '../../components/ErrorBody';
import UserListComponent from '../../components/UserList';
import { useApiDataLoader } from '../../utils/react';

export default function AllUsers()
{
  const limit = 10
  const path = `/users`;
  const [ { data, loading, error }, load ] = useApiDataLoader( path, { users : [] }, { limit } );

  const renderBody = () => {
    if ( error )
      return <ErrorBodyComponent error={ error } />
    if ( ! loading )
      return <UserListComponent list={ data.users } />;
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