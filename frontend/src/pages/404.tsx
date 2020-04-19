import React from 'react'
import { useHistory } from 'react-router-dom';

export default function PageNotFoundPage() {
  let history = useHistory();
  return (
    <div>
      <h1>404</h1>
      <h5>Are you lost?</h5>
      <br/>
      <p className="App-link" onClick={ () =>  history.push("/") } >
        Sorry
      </p>
    </div>
  )
}