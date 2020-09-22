import BaseAPI from '@/api/BaseAPI'

export default class gradingsAPI extends BaseAPI {
  async downloadAnonymousGradings(pubid, flowgradeid ) {
    const params = {
      flowgradeid,
    }
    const { ok } = await this.$axios.get(process.env.API + '/downloads/anon/' + pubid, {
      params,
      responseType: 'blob'
    })
    return ok
  }
}

