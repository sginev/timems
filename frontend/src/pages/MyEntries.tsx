import React from 'react'
import EntryListComponent from '../components/EntryList'
import PageContentHeaderComponent from '../components/PageContentHeader';
import PageContentBodyComponent from '../components/PageContentBody';
import data from '../services/data'

export default function MyEntriesPage() {
  const list = data.getEntries();
  return (
    <div>
      <PageContentHeaderComponent title="My work records" />
      <PageContentBodyComponent>
        <EntryListComponent list={ list } />
      </PageContentBodyComponent>
    </div>
  )
}