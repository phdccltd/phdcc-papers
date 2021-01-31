// console.log('init store page')
export const state = () => ({
  title: '',
  titlesuffix: ''
})

export const mutations = {
  setTitle(_state, title) {
    _state.title = title
    _state.titlesuffix = ''
  },
  setTitleSuffix(_state, titlesuffix) {
    _state.titlesuffix = titlesuffix
  }
}
export const getters = {
  title (_state) {
    return _state.title
  },
  titlesuffix (_state) {
    return _state.titlesuffix
  }
}
/* export const actions = {
  setTitle({ commit }, title) {
    console.log('action setTitle')
    commit('setTitle', title)
  }
} */
