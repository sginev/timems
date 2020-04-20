import React from 'react'
import PageContentHeaderComponent from '../components/PageContentHeader';
import PageContentBodyComponent from '../components/PageContentBody';
import UserListComponent from '../components/UserList';

import data from '../services/data'

export default function AllUsers() {
  const list = data.getUsers();
  return (
    <div>
      <PageContentHeaderComponent title="Time management users" />
      <PageContentBodyComponent>
        <UserListComponent list={ list } />
      </PageContentBodyComponent>
    </div>
  )
}