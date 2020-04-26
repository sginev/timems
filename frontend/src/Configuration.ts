export const MODE = {
  isProduction : process.env.NODE_ENV === 'production',
  isDevelopment : process.env.NODE_ENV === 'development',
  isTest : process.env.NODE_ENV === 'test',
  toString : () => process.env.NODE_ENV
}

export const API_HOST = process.env.REACT_APP_API_URL || ( window.location.origin + '/api' )

export const LOCAL_STORAGE_KEY_ACCESS_TOKEN = "26EsxJNwrrAJz"

export const PAGE_SIZE_OWN_ENTRIES = 15
export const PAGE_SIZE_ALL_ENTRIES = 15
export const PAGE_SIZE_ALL_USERS = 15
