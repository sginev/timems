import React from 'react'

export default function ErrorBodyComponent({ error }) 
{
  return <div>Error: { error.message }</div>;
}