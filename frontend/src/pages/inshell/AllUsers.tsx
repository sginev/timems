import React from 'react'

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import ErrorBodyComponent from '../../components/ErrorBody';
import UserListComponent from '../../components/UserList';
import { useApiDataLoader } from '../../utils/react';
import PaginationComponent from '../../components/Pagination';
import { User } from '../../utils/user';

export default function AllUsers()
{
  const limit = 21
  const path = `/users`;
  const defaultData = { users : new Array<User>(), totalPages : 1, page : 1 };
  const [ { data, loading, error }, load ] = useApiDataLoader( path, defaultData, { limit } );

  data.page = data.page || 1;
  data.totalPages = data.totalPages || 1;

  const reloadData = ( page = data.page ) => {
    load( { page, limit }, data );
  }

  const onPageSelect = ( page:number ) => {
    reloadData( page );
  }

  return (
    <div>
      <PageContentHeaderComponent title="Time management users" />
      { loading && <div className="progress-line"></div> }
      <PageContentBodyComponent>
        <UserListComponent list={ data.users } onChange={ reloadData } />
        <PaginationComponent {...{ currentPage:data.page, lastPage: data.totalPages, onAction:onPageSelect } } />
      </PageContentBodyComponent>
    </div>
  )
}