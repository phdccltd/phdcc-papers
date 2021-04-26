const _ = require('lodash/core')

// console.log('init store sitepages')
export const state = () => ({
  list: [],
  error: false
})

export const mutations = {
  setList (_state, list) {
    // console.log('setList sitepages', list)
    _state.list = list
  },
  setError (_state, error) {
    _state.error = error
  }
}

export const getters = {
  get: (_state) => {
    // console.log('getter sitepages.get')
    return (path) => {
      return _.find(_state.list, _sitepage => { return _sitepage.path === path })
    }
  },
  getall: (_state) => {
    // console.log('getter sitepages.getall')
    return () => {
      return _.filter(_state.list, (sitepage) => { return sitepage.id !== 0 })
    }
  },
  apiversion: (_state) => {
    const sitepage = _.find(_state.list, _sitepage => { return _sitepage.id === 0 })
    return sitepage ? sitepage.content : ''
  },
  error: _state => _state.error
}

export const actions = {
  async fetch ({ commit }) {
    // console.log('store fetch sitepages.actions')
    const { sitepages } = await this.$api.sitepages.fetch({})
    // console.log('fetch setList sitepages', sitepages)
    for (const sitepage of sitepages) {
      sitepage.visible = false
    }
    commit('setList', sitepages)
  },

  clearError ({ commit }) {
    // console.log('clearError users.action')
    commit('setError', false)
  }
}
