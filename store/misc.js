import Vue from 'vue'

export const state = () => ({
  items: {}
})

export const mutations = {
  set (_state, params) {
    Vue.set(_state.items, params.key, params.value)
  },
  clearAll (_state) {
    _state.items = {}
  }
}

export const getters = {
  get: _state => key => _state.items[key]
}

export const actions = {
  set ({ commit }, params) {
    commit('set', params)
  },
  clear ({ commit }) {
    commit('clearAll')
  }
}
