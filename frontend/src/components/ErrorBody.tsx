import React from 'react'

import Alert from 'react-bootstrap/Alert'

export default function ErrorBodyComponent({ error }) 
{
  return (
    <Alert variant="danger">
      <Alert.Heading>Error</Alert.Heading>
      <p>
        { error.message }
      </p>
    </Alert>
  )
}