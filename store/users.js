//console.log('init store users')
export const state = () => ({
  list: [],
})

export const mutations = {
  add(state, item) {
    console.log('add user', item)
    state.push(item)
  },

  setList(state, list) {
    console.log('setList user', list)
    state.list = list
  },

  clearAll(state) {
    console.log('clearAll user')
    state.list = []
  },
}

export const getters = {
  list: (state) => {
    console.log('getter user.list')
    return state.list
  },
}

export const actions = {
  async fetch({ commit }, params) {
    console.log('store fetch user.actions', params)
    const { user, users } = await this.$api.users.fetch(params)
    if (params && params.id) {
      console.log('fetch add user', user)
      commit('add', user)
    } else {
      console.log('fetch setList user', users)
      commit('setList', users)
    }
  },

  clear({ commit }) {
    console.log('clear user.action')
    commit('clearAll')
  },
}
