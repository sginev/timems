export interface Entry
{
  id : string
  userId : string
  duration : number
  day : number
  notes : string
  _dailyTotalDuration? : number
  _username? : number
}

export const millisecondsToDays = ms => ~~( ms / ( 1000 * 60 * 60 * 24 ) ) + 1
export const daysToMilliseconds = days => ( days * 1000 * 60 * 60 * 24 )
