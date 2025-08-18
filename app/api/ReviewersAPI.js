import BaseAPI from './BaseAPI'

export default class ReviewersAPI extends BaseAPI {
  async removeReviewer (submitid, submitreviewerid) {
    const data = {
      submitreviewerid
    }
    const { ok } = await this.$del('/reviewers/' + submitid, data)
    return ok
  }

  async addReviewer (submitid, userid, lead) {
    const data = {
      userid,
      lead
    }
    const { ok } = await this.$post('/reviewers/' + submitid, data)
    return ok
  }
}
