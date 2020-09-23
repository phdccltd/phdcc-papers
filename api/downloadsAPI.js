import BaseAPI from '@/api/BaseAPI'

export default class gradingsAPI extends BaseAPI {
  async downloadAnonymousGradings(pubid, flowgradeid ) {
    const params = {
      flowgradeid,
    }
    const ret = await this.$axios.get(process.env.API + '/downloads/anon/' + pubid, {
      params,
      responseType: 'blob'
    })
    console.log('downloadAnonymousGradings GOT', ret)
    return ret
  }
}

