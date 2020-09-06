import BaseAPI from '@/api/BaseAPI'

export default class mailtemplatesAPI extends BaseAPI {
  get(flowid) {
    return this.$get('/mailtemplates/' + flowid)
  }
  async deleteMailTemplate(flowid, templateid) {
    const data = {
      templateid,
    }
    const { ok } = await this.$del('/mailtemplates/' + flowid, data)
    return ok
  }
  async addEditMailTemplate(flowid, templateid, templatename, templatesubject, templatebody) {
    const data = {
      templateid,
      templatename,
      templatesubject,
      templatebody,
    }
    const { ok } = await this.$post('/mailtemplates/' + flowid, data)
    return ok
  }
}

