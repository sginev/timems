import { useState, useEffect } from 'react';

import api from '../services/api'

export function useApiLoader<T>( apiPath:string, defaultValue:T ) {
  type State = { error?:Error, loading:boolean, data:T };
  const [ state, setState ] = useState<State>({ data:defaultValue, loading:true });
  useEffect( () => {
    ( async ()=> {
      try {
        // await new Promise( re => setTimeout( re, 1500 ) )
        const data = await api.request( apiPath, "get" );
        setState({ data, loading:false });
      } catch ( error ) {
        setState({ error, data:defaultValue, loading:false });
      }
    } )()
  }, [] )

  return state;
}
