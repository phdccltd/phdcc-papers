const _ = require('lodash/core')

// console.log('init store sitepages')
export const state = () => ({
  list: []
})

export const mutations = {
  setList (_state, list) {
    // console.log('setList sitepages', list)
    _state.list = list
  },

  clearAll (_state) {
    console.log('clearAll sitepages')
    _state.list = []
  }
}

export const getters = {
  get: (_state) => {
    // console.log('getter sitepages.get')
    return (path) => {
      // console.log('getter sitepages.get path', path)
      // console.log('getter sitepages.get list', state.list)
      const sitepage = _.find(_state.list, _sitepage => { return _sitepage.path === path })
      return sitepage
    }
  }
}

export const actions = {
  async fetch ({ commit }) {
    // console.log('store fetch sitepages.actions')
    const { sitepages } = await this.$api.sitepages.fetch({})
    // console.log('fetch setList sitepages', sitepages)
    commit('setList', sitepages)
  },

  clear ({ commit }) {
    console.log('clear sitepages.action')
    commit('clearAll')
  }
}
