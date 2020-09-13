import BaseAPI from '@/api/BaseAPI'

export default class gradingsAPI extends BaseAPI {
  async deleteGrading(submitid, gradingid) {
    const data = {
      gradingid,
    }
    const { ok } = await this.$del('/gradings/' + submitid, data)
    return ok
  }
  async addGrading(submitid, flowgradeid, decision, comment, canreview) {
    const data = { // User is auth
      flowgradeid,
      decision,
      comment,
      canreview,
    }
    const { ok } = await this.$post('/gradings/' + submitid, data)
    return ok
  }
}

