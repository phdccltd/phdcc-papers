import BaseAPI from '@/api/BaseAPI'

export default class pubAPI extends BaseAPI {
  fetch (params) {
    // console.log('pubAPI fetch')
    // if (params && 'id' in params) return this.$get('/pubs/' + params.id)
    return this.$get('/pubs', params)
  }

  async addPub (pubname, pubdescr) {
    const data = {
      pubname,
      pubdescr
    }
    const { ok } = await this.$post('/pubs', data)
    return ok
  }

  async deletePub(pubid) {
    console.log('deletePub', pubid)
    const { ok } = await this.$del('/pubs/' + pubid)
    return ok
  }

  /// //////////
  // POST bulk op: for all submits at FROM status, add new TO status
  async bulkSubmitStatusUpdate (pubid, fromstatus, tostatus) {
    console.log('pubAPI bulkSubmitStatusUpdateaddSubmitStatus', pubid, fromstatus, tostatus)
    const data = { fromstatus, tostatus }
    const { status } = await this.$postOverride('POST', '/pubs/bulk/' + pubid, data)
    return status
  }
}
