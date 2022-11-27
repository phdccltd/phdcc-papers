import BaseAPI from './BaseAPI'

export default class AuthAPI extends BaseAPI {
    async login(loginInfo) {
        return this.$post('/user/login', loginInfo) // email, password, grecaptcharesponse
    }
    async getuser(params) {
        console.log("PARAMS", params)
        return this.$get('/user', params) // headers: Authorization
    }
    async register(params) {
        console.log('authAPI register')
        return this.$post('/user/register', params)
    }

    async save(params) {
        console.log('authAPI save')
        return this.$patch('/user', params)
    }

    async forgotpwd(params) {
        console.log('authAPI forgotpwd')
        const { forgotten } = await this.$post('/user/forgot', params)
        return forgotten
    }

    async masquerade(userid) {
        console.log('authAPI masquerade', userid)
        const { ok } = await this.$get('/users/masquerade/' + userid)
        return ok
    }

}
