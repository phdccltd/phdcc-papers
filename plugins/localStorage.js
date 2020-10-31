// Runs in client
// https://github.com/robinvdvleuten/vuex-persistedstate

import createPersistedState from 'vuex-persistedstate'

const STORAGE = window.localStorage
const STORAGE_KEY = 'papers'

export default ({ store }) => {
  console.log('==================== localStorage')
  // Before leaving the page, make sure we save the state
  window.addEventListener('beforeunload', () => {
    // console.log('Save state before unload - NO ACTION FOR NOW')
    // if (settingState) {
    //  trySaving(STORAGE, settingState)
    // }
  })

  createPersistedState({
    key: STORAGE_KEY,
    storage: STORAGE
    /* paths: [
      'auth.user',
      'helpboxes.visible',
    ] */
  })(store)
}
