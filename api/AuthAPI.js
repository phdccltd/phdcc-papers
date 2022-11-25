import BaseAPI from './BaseAPI'

export default class AuthAPI extends BaseAPI {
    async login(loginInfo) {
        return this.$post('/user/login', loginInfo) // email, password, grecaptcharesponse
    }
    async getuser(params) {
        console.log("PARAMS",params)
        return this.$get('/user', params) // headers: Authorization
    }
}
