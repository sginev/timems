import React from 'react'

import PageContentHeaderComponent from '../../components/core/PageContentHeader';
import PageContentBodyComponent from '../../components/core/PageContentBody';
import UserListComponent from '../../components/lists/UserList';
import { useApiDataLoader } from '../../utils/react';
import PaginationComponent from '../../components/common/Pagination';
import { User } from '../../utils/user';

import { PAGE_SIZE_ALL_USERS } from '../../Configuration'

export default function AllUsers()
{
  const limit = PAGE_SIZE_ALL_USERS
  const path = `/users`;
  const defaultData = { users : new Array<User>(), totalPages : 1, page : 1 };
  const [ { data, loading }, load ] = useApiDataLoader( path, defaultData, { limit } );

  data.page = data.page || 1;
  data.totalPages = data.users.length && ( data.totalPages || 1 );

  const reloadData = ( page = data.page ) => {
    load( { page: +page, limit }, data );
  }

  const onPageSelect = ( page:number ) => {
    reloadData( page );
  }

  return (
    <>
      <PageContentHeaderComponent title="All user accounts" />
      { loading && <div className="progress-line"></div> }
      <PageContentBodyComponent>
        <UserListComponent list={ data.users } onChange={ reloadData } />
        <PaginationComponent {...{ currentPage:data.page, lastPage: data.totalPages, onAction:onPageSelect } } />
      </PageContentBodyComponent>
    </>
  )
}