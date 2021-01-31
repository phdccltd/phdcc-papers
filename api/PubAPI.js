import BaseAPI from '@/api/BaseAPI'

export default class pubAPI extends BaseAPI {
  fetch (params) {
    // console.log('pubAPI fetch')
    // if (params && 'id' in params) return this.$get('/pubs/' + params.id)
    return this.$get('/pubs', params)
  }

  /// //////////
  // POST bulk op: for all submits at FROM status, add new TO status
  async bulkSubmitStatusUpdate (pubid, fromstatus, tostatus) {
    console.log('pubAPI bulkSubmitStatusUpdateaddSubmitStatus', pubid, fromstatus, tostatus)
    const data = { fromstatus, tostatus }
    const { status } = await this.$postOverride('POST', '/pubs/' + pubid, data)
    return status
  }
}
