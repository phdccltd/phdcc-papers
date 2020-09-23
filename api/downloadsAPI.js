import BaseAPI from '@/api/BaseAPI'

export default class gradingsAPI extends BaseAPI {
  async downloadAnonymousStageSubmissions(pubid, selectedstage ) {
    const params = {
      flowstageid: selectedstage,
    }
    const ret = await this.$axios.get(process.env.API + '/downloads/anon/' + pubid, {
      params,
      responseType: 'blob'
    })
    //console.log('downloadAnonymousStageSubmissions GOT', ret)
    return ret
  }
}

