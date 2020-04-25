import { useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';

import api from '../services/api'

export function useApiDataLoader<T>( apiPath:string, defaultValue:T, params?:any ) {
  type State = { error?:Error, loading:boolean, data:T };
  
  const [ state, setState ] = useState<State>({ data:defaultValue, loading:true });
  const { addToast } = useToasts();
  
  const load = async ( params?:any, fallbackValue=defaultValue ) => {
    setState({ data:fallbackValue, loading:true });
    try {
      // await new Promise( re => setTimeout( re, 1500 ) )
      const data = await api.request( apiPath, "get", params );
      setState({ data, loading:false });
    } catch ( error ) {
      addToast( error.message, { appearance : "error" } )
      setState({ error, data:fallbackValue, loading:false });
    }
  }

  useEffect( () => { load( params ) }, [] )

  return [ state, load ] as [ State, (params?: any, fallbackValue?: T) => Promise<void> ];
}
