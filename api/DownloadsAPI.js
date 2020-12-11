import BaseAPI from '@/api/BaseAPI'

export default class gradingsAPI extends BaseAPI {
  async downloadAnonymousStageSubmissions (pubid, selectedstage) {
    const params = {
      flowstageid: selectedstage
    }
    const ret = await this.$axios.get(process.env.API + '/downloads/anon/' + pubid, {
      params,
      responseType: 'blob'
    })
    return ret
  }

  async downloadSummary (pubid, selectedstage) {
    const params = {
      flowstageid: selectedstage
    }
    const ret = await this.$axios.get(process.env.API + '/downloads/summary/' + pubid, {
      params,
      responseType: 'blob'
    })
    return ret
  }

  async downloadAll(pubid, selectedstage) {
    const params = {
      flowstageid: selectedstage
    }
    const ret = await this.$axios.get(process.env.API + '/downloads/all/' + pubid, {
      params,
      responseType: 'blob'
    })
    return ret
  }

  async downloadReviewerPerformance(pubid, selectedgrade) {
    const params = {
      flowgradeids: selectedgrade.join(',')
    }
    const ret = await this.$axios.get(process.env.API + '/downloads/reviewers/' + pubid, {
      params,
      responseType: 'blob'
    })
    return ret
  }
}
