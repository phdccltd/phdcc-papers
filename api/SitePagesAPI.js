import BaseAPI from './BaseAPI'

export default class SitePagesAPI extends BaseAPI {
  async fetch (params) {
    console.log('SitePagesAPI fetch')
    return this.$get('/sitepages', params)
  }

  async deleteSitePage (pageid) {
    console.log('deleteSitePage', pageid)
    const data = {
      pageid
    }
    const { ok } = await this.$del('/sitepages', data)
    return ok
  }

  async addEditSitePage (pageid, pagepath, pagetitle, pagecontent) {
    const data = {
      pageid,
      pagepath,
      pagetitle,
      pagecontent
    }
    const { ok } = await this.$post('/sitepages', data)
    return ok
  }
}
