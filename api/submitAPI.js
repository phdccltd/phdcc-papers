import BaseAPI from '@/api/BaseAPI'
import { APIError } from './BaseAPI';


export default class submitAPI extends BaseAPI {
  fetchpub(params) {
    //console.log('submitAPI fetchpub')
    if (params && 'pubid' in params) return this.$get('/submits/pub/' + params.pubid)
    return false
    //return this.$get('/submits', params)
  }
  fetchentry(params) {
    //console.log('submitAPI fetchentry')
    if (params && 'entryid' in params) return this.$get('/submits/entry/' + params.entryid)
    return false
    //return this.$get('/submits', params)
  }
  fetchformfields(params) {
    //console.log('submitAPI fetchentry')
    if (params && 'flowstageid' in params) return this.$get('/submits/formfields/' + params.flowstageid)
    return false
    //return this.$get('/submits', params)
  }

  // POST add whole entry: use FormData not responsedata https://xhr.spec.whatwg.org/#interface-formdata
  async addEntry(entry) {
    console.log('submitAPI addEntry', entry)

    const data = new FormData()
    data.append('pubid', entry.pubid)
    data.append('flowid', entry.flowid)
    data.append('stageid', entry.stageid)
    data.append('submitid', entry.submitid)
    for (const fv of entry.values) {
      if (fv.file) {
        console.log('addEntry FILE', fv.file, fv.file.name)
        data.append('file', fv.file, fv.file.name)
        fv.file = fv.file.name
      }
      data.append('values', JSON.stringify(fv))
    }
    const ret = await this.$axios.post(process.env.API + '/submits/entry', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    })
    //if (ret.status === 200 && ret.data.ret === 0) {
    if (ret.data.ret !== 0) {
      throw new APIError(
        {
          request: {},
          response: {
            status: ret.status,
            data: ret.data,
          },
        },
        ret.data.status
      )
    }
    console.log('addEntry returned', ret.data)
    return ret.data.id
  }

// PUT change whole entry, becomes:
// POST edit: replace whole entry: use FormData not responsedata https://xhr.spec.whatwg.org/#interface-formdata
// /submits/entry/24
  async editEntry(entry) {
    console.log('submitAPI editEntry', entry)

    const data = new FormData()
    data.append('pubid', entry.pubid)
    data.append('flowid', entry.flowid)
    data.append('stageid', entry.stageid)
    data.append('submitid', entry.submitid)
    for (const fv of entry.values) {
      if (fv.file) {
        console.log('editEntry FILE', fv.file, fv.file.name)
        data.append('file', fv.file, fv.file.name)
        fv.file = fv.file.name
      }
      data.append('values', JSON.stringify(fv))
    }
    return false
    const ret = await this.$axios.post(process.env.API + '/submits/entry/' + entry.id, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-HTTP-Method-Override': 'PUT',
      },
    })
    //if (ret.status === 200 && ret.data.ret === 0) {
    if (ret.data.ret !== 0) {
      throw new APIError(
        {
          request: {},
          response: {
            status: ret.status,
            data: ret.data,
          },
        },
        ret.data.status
      )
    }
    console.log('editEntry returned', ret.data)
    return ret.data.id
  }
  async getFile(relpath) {
    console.log('submitAPI getFile', relpath)
    // https://morioh.com/p/f4d331b62cda
    // https://stackoverflow.com/questions/53772331/vue-html-js-how-to-download-a-file-to-browser-using-the-download-tag
    const ret = await this.$axios.get(process.env.API + '/submits/entry/' + relpath, {
      responseType: 'blob'
    })
    console.log('submitAPI getFile GOT', ret)
    return ret
  }
  // DELETE entry
  async deleteEntry(entryid) {
    console.log('submitAPI deleteEntry')
    const { ok } = await this.$del('/submits/entry/'+entryid)
    return ok
  }
  // PATCH change part of entry
}
