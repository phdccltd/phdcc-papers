import BaseAPI from '@/api/BaseAPI'

export default class pubAPI extends BaseAPI {
  fetch (params) {
    // console.log('pubAPI fetch')
    // if (params && 'id' in params) return this.$get('/pubs/' + params.id)
    return this.$get('/pubs', params)
  }

  /* register(params) {
    console.log('userAPI register')
    return this.$post('/user/register', params)
  }

  share(id, uid) {
    return this.$post('/users', { id, uid, action: 'Do' })
  }

  hide(id, uid) {
    return this.$post('/users', { id, uid, action: 'Hide' })
  } */
}
