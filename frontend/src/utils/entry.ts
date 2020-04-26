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

export interface Day
{
  day : number
  totalDuration : number
  notes : string[]
  entriesCount : number
}

export const millisecondsToDays = ms => Math.ceil( ms / ( 1000 * 60 * 60 * 24 ) ) + 1
export const daysToMilliseconds = days => ( days * 1000 * 60 * 60 * 24 )
