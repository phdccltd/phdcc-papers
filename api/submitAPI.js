import BaseAPI from '@/api/BaseAPI'


export default class submitAPI extends BaseAPI {
  fetch(params) {
    console.log('submitAPI fetch')
    if (params && 'pubid' in params) return this.$get('/submits/' + params.pubid)
    return this.$get('/submits', params)
  }

  /*register(params) {
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
