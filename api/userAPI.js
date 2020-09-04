import BaseAPI from '@/api/BaseAPI'


export default class userAPI extends BaseAPI {
  /*fetch(params) {
    console.log('UsersAPI fetch')
    if (params && 'id' in params) return this.$get('/users/' + params.id)
    else return this.$get('/users', params)
    return users
  }*/

  getPubUsers(pubid) {
    return this.$get('/users/pub/' + pubid)
  }

  async deleteUserRole(pubid, userid, roleid) {
    console.log('deleteUserRole', pubid, userid, roleid)
    const { ok } = await this.$del('/users/pub/' + pubid + '/' + userid + '/' + roleid)
    return ok
  }

  async addUserRole(pubid, userid, roleid) {
    console.log('addUserRole', pubid, userid, roleid)
    const { ok } = await this.$post('/users/pub/' + pubid + '/' + userid + '/' + roleid)
    return ok
  }

  register(params) {
    console.log('userAPI register')
    return this.$post('/user/register', params)
  }

  save(params) {
    console.log('userAPI save')
    return this.$patch('/user', params)
  }

  /* share(id, uid) {
    return this.$post('/users', { id, uid, action: 'Do' })
  }

  hide(id, uid) {
    return this.$post('/users', { id, uid, action: 'Hide' })
  } */
}
