import BaseAPI from '@/api/BaseAPI'

export default class acceptingsAPI extends BaseAPI {
  async deleteAccepting(flowid, acceptingid) {
    const data = {
      acceptingid,
    }
    const { ok } = await this.$del('/acceptings/' + flowid, data)
    return ok
  }
  async addEditAccepting(flowid, acceptingid, chosenstage, chosenopen, chosenstatus) {
    const data = {
      acceptingid,
      chosenstage,
      chosenopen,
      chosenstatus,
    }
    const { ok } = await this.$post('/acceptings/' + flowid, data)
    return ok
  }
}

