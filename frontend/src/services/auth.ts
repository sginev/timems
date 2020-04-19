import hooks from './hooks'

const KEY_ACCESS_TOKEN = "ACCESS_TOKEN";

const fakeAuthenticationService = {
  isLoggedIn() {
    return !! localStorage.getItem( KEY_ACCESS_TOKEN )
  },
  async authenticate() {
    await new Promise( re => setTimeout( re, 250 ) )
    localStorage.setItem( KEY_ACCESS_TOKEN, "MUSAKA" )
    hooks.forceUpdateApp()
  },
  async signout() {
    await new Promise( re => setTimeout( re, 250 ) )
    localStorage.removeItem( KEY_ACCESS_TOKEN )
    hooks.forceUpdateApp()
  }
}

export default fakeAuthenticationService