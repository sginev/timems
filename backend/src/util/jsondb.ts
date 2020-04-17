import fs from "fs"

export default class JsonDB<T extends any>
{
  saveInterval = 2.000

  destroy = false
  data:T = {} as T

  constructor( private filepath:string ) {}
  
  async initialize()
  {
    try {
      let json = await fs.promises.readFile( this.filepath, "utf8" )
      this.data = JSON.parse( json )
      return true
    } catch ( e ) {
      if ( e.code != 'ENOENT' )
        throw e
      this.data = {} as T
      return false
    } finally {
      this.beginDirtyLoop()
    }
  }

  async beginDirtyLoop() 
  {
    while( ! this.destroy ) {
      if ( this.isDirty() )
        this.saveToFile()
      await sleep( this.saveInterval )
    }
  }

  isDirty()
  {
    return true
  }

  async saveToFile() 
  {
    if ( ! this.data )
      return
    const data = JSON.stringify( this.data, null, 2 )
    await fs.promises.writeFile( this.filepath, data, "utf8" )
  }
}

async function sleep( seconds:number ) {
  await new Promise( resolve => setTimeout( resolve, seconds * 1000 ) )
}