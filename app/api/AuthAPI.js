import BaseAPI from './BaseAPI'

export default class AuthAPI extends BaseAPI {
  async login(loginInfo) {
    return this.$post('/user/login', loginInfo) // email, password, grecaptcharesponse
  }
  async logout() {
    return this.$delete('/user/logout')
  }
  async getuser(params) {
    // console.log("getuser", params)
    return this.$get('/user', params) // headers: Authorization
  }
  async register(params) {
    // console.log('authAPI register')
    return this.$post('/user/register', params)
  }

  async save(params) {
    // console.log('authAPI save')
    return this.$patch('/user', params)
  }

  async forgotpwd(params) {
    // console.log('authAPI forgotpwd')
    const { forgotten } = await this.$post('/user/forgot', params)
    return forgotten
  }

  async masquerade(userid) {
    // console.log('authAPI masquerade', userid)
    const { ok } = await this.$get('/users/masquerade/' + userid)
    return ok
  }

  async getUsers() {
    return this.$get('/users')
  }

  async getPubUsers(pubid) {
    return this.$get('/users/pub/' + pubid)
  }

  async removePubUser(pubid, userid) {
    console.log('removePubUser', pubid, userid)
    const data = await this.$del('/users/pub/' + pubid + '/' + userid)
    console.log('removedPubUser', data)
    if (data.ret != 0) throw new Error(data.status)
    return data.ok
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


}
