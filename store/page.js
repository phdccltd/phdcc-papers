//console.log('init store page')
export const state = () => ({
  title: '',
})

export const mutations = {
  setTitle(state, title) {
    state.title = title
  }
}
export const getters = {
  title(state) {
    return state.title
  }
}
/*export const actions = {
  setTitle({ commit }, title) {
    console.log('action setTitle')
    commit('setTitle', title)
  }
}*/
