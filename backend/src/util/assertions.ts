import ApiError from '../types/ApiError';

export const assertAccess = ( condition:boolean, errorMessage="Access denied." ) => {
  if ( ! condition )
    throw new ApiError( errorMessage, 403 )
}

export const assertFound = ( target:any, name="Object" ) => {
  if ( ! target )
    throw new ApiError( name + ' not found.', 404 )
}

export const assert = ( condition:boolean, errorMessage="API Error", statusCode=500 ) => {
  if ( ! condition )
    throw new ApiError( errorMessage, statusCode )
}
