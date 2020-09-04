import BaseAPI from '@/api/BaseAPI'

export default class mailtemplatesAPI extends BaseAPI {
  get(flowid) {
    return this.$get('/mailtemplates/' + flowid)
  }
}
