export default {
  ENVIRONMENT : process.env.NODE_ENV || 'development' ,
  PORT : process.env.PORT || 3000 ,
  HTTPS : false ,

  // TODO when scaling up, rework into actual MongoDB (or other)
  DATABASE_FILEPATH : `./temp/database.json` , 

  isDev() { return this.ENVIRONMENT === 'development' } ,
  isProd() { return this.ENVIRONMENT === 'production' } ,
}