import BaseAPI from './BaseAPI'

export default class MailAPI extends BaseAPI {
  getTemplates(pubid) {
    return this.$get('/mail/templates/' + pubid)
  }

  async deleteMailTemplate(pubid, templateid) {
    const data = {
      templateid
    }
    const { ok } = await this.$del('/mail/templates/' + pubid, data)
    return ok
  }

  async addEditMailTemplate(pubid, templateid, templatename, templatesubject, templatebody) {
    const data = {
      templateid,
      templatename,
      templatesubject,
      templatebody
    }
    const { ok } = await this.$post('/mail/templates/' + pubid, data)
    return ok
  }

  async sendMail(pubid, selecteduser, selectedrole, mailsubject, mailtext) {
    const data = {
      selecteduser,
      selectedrole,
      mailsubject,
      mailtext
    }
    const { ok } = await this.$post('/mail/' + pubid, data)
    return ok
  }
}
