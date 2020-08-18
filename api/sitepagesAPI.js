import BaseAPI from '@/api/BaseAPI'


export default class sitepagesAPI extends BaseAPI {
  fetch(params) {
    console.log('sitepagesAPI fetch')
    return this.$get('/sitepages', params)
  }
}
