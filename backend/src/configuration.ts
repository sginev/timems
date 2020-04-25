export default {
  ENVIRONMENT : process.env.NODE_ENV || 'development' ,
  PORT : process.env.PORT || 3000 ,
  HTTPS : false ,

  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_AUTHDB: process.env.DATABASE_AUTHDB,

  isDev() { return this.ENVIRONMENT === 'development' } ,
  isProd() { return this.ENVIRONMENT === 'production' } ,
}