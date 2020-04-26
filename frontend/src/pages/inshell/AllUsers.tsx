import React from 'react'

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import UserListComponent from '../../components/UserList';
import { useApiDataLoader } from '../../utils/react';
import PaginationComponent from '../../components/Pagination';
import { User } from '../../utils/user';

import { PAGE_SIZE_ALL_USERS } from '../../Configuration'

export default function AllUsers()
{
  const limit = PAGE_SIZE_ALL_USERS
  const path = `/users`;
  const defaultData = { users : new Array<User>(), totalPages : 1, page : 1 };
  const [ { data, loading }, load ] = useApiDataLoader( path, defaultData, { limit } );

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
      <PageContentHeaderComponent title="All user accounts" />
      { loading && <div className="progress-line"></div> }
      <PageContentBodyComponent>
        <UserListComponent list={ data.users } onChange={ reloadData } />
        <PaginationComponent {...{ currentPage:data.page, lastPage: data.totalPages, onAction:onPageSelect } } />
      </PageContentBodyComponent>
    </div>
  )
}