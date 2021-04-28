import BaseAPI from '@/api/BaseAPI'

export default class userAPI extends BaseAPI {
  /* fetch(params) {
    console.log('UsersAPI fetch')
    if (params && 'id' in params) return this.$get('/users/' + params.id)
    else return this.$get('/users', params)
    return users
  } */

  getUsers() {
    return this.$get('/users')
  }

  getPubUsers (pubid) {
    return this.$get('/users/pub/' + pubid)
  }

  async removePubUser (pubid, userid) {
    console.log('removePubUser', pubid, userid)
    const { ok } = await this.$del('/users/pub/' + pubid + '/' + userid)
    return ok
  }

  async deleteUserRole (pubid, userid, roleid) {
    console.log('deleteUserRole', pubid, userid, roleid)
    const { ok } = await this.$del('/users/pub/' + pubid + '/' + userid + '/' + roleid)
    return ok
  }

  async addUserRole (pubid, userid, roleid) {
    console.log('addUserRole', pubid, userid, roleid)
    const { ok } = await this.$post('/users/pub/' + pubid + '/' + userid + '/' + roleid)
    return ok
  }

  register (params) {
    console.log('userAPI register')
    return this.$post('/user/register', params)
  }

  save (params) {
    console.log('userAPI save')
    return this.$patch('/user', params)
  }

  async forgotpwd (params) {
    console.log('userAPI forgotpwd')
    const { forgotten } = await this.$post('/user/forgot', params)
    return forgotten
  }

  async masquerade (userid) {
    console.log('masquerade', userid)
    const { ok } = await this.$get('/users/masquerade/' + userid)
    return ok
  }
}
