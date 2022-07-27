// Runs in client
// https://github.com/robinvdvleuten/vuex-persistedstate

import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  new VuexPersistence({
    key: 'papers',
    storage: window.localStorage
  }).plugin(store);
}
