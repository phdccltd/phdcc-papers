import Vue from 'vue'

export const state = () => ({
  items: {}
})

export const mutations = {
  set(state, params) {
    Vue.set(state.items, params.key, params.value)
  },
  clearAll(state) {
    state.items = {}
  },
}

export const getters = {
  get: state => key => state.items[key]
}

export const actions = {
  set({ commit }, params) {
    commit('set', params)
  },
  clear({ commit }) {
    commit('clearAll')
  },
}
