import React from 'react'

import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import ErrorBodyComponent from '../../components/ErrorBody';
import EntryListComponent from '../../components/EntryList'
import { useApiLoader } from '../../utils/react';

import user from '../../services/user';

export default function MyEntriesPage() 
{
  const path = `/users/${ user.id }/entries`
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
      <PageContentHeaderComponent title="My work records" />
      { loading && <div className="progress-line"></div> }
      <PageContentBodyComponent>
        { renderBody() }
      </PageContentBodyComponent>
    </div>
  )
}