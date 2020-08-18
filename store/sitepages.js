const _ = require('lodash/core')

//console.log('init store sitepages')
export const state = () => ({
  list: [],
})

export const mutations = {
  setList(state, list) {
    //console.log('setList sitepages', list)
    state.list = list
  },

  clearAll(state) {
    console.log('clearAll sitepages')
    state.list = []
  },
}

export const getters = {
  get: (state) => {
    //console.log('getter sitepages.get')
    return (path) => {
      //console.log('getter sitepages.get path', path)
      //console.log('getter sitepages.get list', state.list)
      const sitepage = _.find(state.list, sitepage => { return sitepage.path === path })
      return sitepage
    }
  },
}

export const actions = {
  async fetch({ commit }) {
    //console.log('store fetch sitepages.actions')
    const { sitepages } = await this.$api.sitepages.fetch({})
    //console.log('fetch setList sitepages', sitepages)
    commit('setList', sitepages)
  },

  clear({ commit }) {
    console.log('clear sitepages.action')
    commit('clearAll')
  },
}
