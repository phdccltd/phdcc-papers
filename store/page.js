//console.log('init store page')
export const state = () => ({
  title: '',
  titlesuffix: '',
})

export const mutations = {
  setTitle(state, title) {
    state.title = title
    state.titlesuffix = ''
  },
  setTitleSuffix(state, titlesuffix) {
    state.titlesuffix = titlesuffix
  },
}
export const getters = {
  title(state) {
    return state.title
  },
  titlesuffix(state) {
    return state.titlesuffix
  },
}
/*export const actions = {
  setTitle({ commit }, title) {
    console.log('action setTitle')
    commit('setTitle', title)
  }
}*/
