import BaseAPI from '@/api/BaseAPI'

export default class mailAPI extends BaseAPI {
  getTemplates(flowid) {
    return this.$get('/mail/templates/' + flowid)
  }
  async deleteMailTemplate(flowid, templateid) {
    const data = {
      templateid,
    }
    const { ok } = await this.$del('/mail/templates/' + flowid, data)
    return ok
  }
  async addEditMailTemplate(flowid, templateid, templatename, templatesubject, templatebody) {
    const data = {
      templateid,
      templatename,
      templatesubject,
      templatebody,
    }
    const { ok } = await this.$post('/mail/templates/' + flowid, data)
    return ok
  }
}

