import axios from 'axios'

import BaseAPI from './BaseAPI'

export default class SubmitAPI extends BaseAPI {
  /// //////////
  fetchpub(params) {
    // console.log('submitAPI fetchpub')
    if (params && 'pubid' in params) return this.$get('/submits/pub/' + params.pubid)
    return false
    // return this.$get('/submits', params)
  }

  /// //////////
  fetchentry(params) {
    // console.log('submitAPI fetchentry')
    if (params && 'entryid' in params) return this.$get('/submits/entry/' + params.entryid)
    return false
    // return this.$get('/submits', params)
  }

  /// //////////
  fetchformfields(params) {
    // console.log('submitAPI fetchentry')
    if (params && 'flowstageid' in params) return this.$get('/submits/formfields/' + params.flowstageid)
    return false
    // return this.$get('/submits', params)
  }

  /// //////////
  // POST add whole entry: use FormData not responsedata https://xhr.spec.whatwg.org/#interface-formdata
  async addSubmitEntry(entry, flowid) {
    console.log('submitAPI addSubmitEntry', entry)
    return this.addSubmitOrEntry(entry, '/submits/submit/' + parseInt(flowid))
  }

  /// //////////
  // POST add whole entry: use FormData not responsedata https://xhr.spec.whatwg.org/#interface-formdata
  async addEntry(entry) {
    console.log('submitAPI addEntry', entry)
    return this.addSubmitOrEntry(entry, '/submits/entry')
  }

  /// //////////
  async addSubmitOrEntry(entry, apiurl) {
    const data = new FormData()
    data.append('pubid', entry.pubid)
    data.append('flowid', entry.flowid)
    data.append('stageid', entry.stageid)
    data.append('submitid', entry.submitid)
    if (entry.title) data.append('title', entry.title)
    for (const fv of entry.values) {
      if (fv.file) {
        const GivenFilename = fv.formfieldid + '-' + fv.file.name
        data.append('files', fv.file, GivenFilename)
        fv.file = fv.file.name
      }
      data.append('values', JSON.stringify(fv))
    }
    const ret = await axios.post(process.env.API + apiurl, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    // if (ret.status === 200 && ret.data.ret === 0) {
    if (ret.data.ret !== 0) {
      throw new APIError(
        {
          request: {},
          response: {
            status: ret.status,
            data: ret.data
          }
        },
        ret.data.status
      )
    }
    console.log('addEntry returned', ret.data)
    return ret.data
  }

  /// //////////
  // Edit entry
  // Use POST with X-HTTP-Method-Override PUT at /submits/entry/<id>
  // Replace whole entry
  async editEntry(entry) {
    console.log('submitAPI editEntry', entry)

    // Use FormData as it may contain a file https://xhr.spec.whatwg.org/#interface-formdata
    const data = new FormData()
    data.append('pubid', entry.pubid)
    data.append('flowid', entry.flowid)
    data.append('stageid', entry.stageid)
    data.append('submitid', entry.submitid)
    for (const fv of entry.values) {
      if (fv.file) {
        // console.log('editEntry FILE', fv.file, fv.file.name)
        const GivenFilename = fv.formfieldid + '-' + fv.file.name
        data.append('files', fv.file, GivenFilename)
        fv.file = fv.file.name
      }
      data.append('values', JSON.stringify(fv))
    }
    const ret = await axios.post(process.env.API + '/submits/entry/' + entry.id, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-HTTP-Method-Override': 'PUT'
      }
    })
    // if (ret.status === 200 && ret.data.ret === 0) {
    if (ret.data.ret !== 0) {
      throw new APIError(
        {
          request: {},
          response: {
            status: ret.status,
            data: ret.data
          }
        },
        ret.data.status
      )
    }
    console.log('editEntry returned', ret.data)
    return ret.data.id
  }

  /// //////////
  async getFile(relpath) {
    console.log('submitAPI getFile', relpath)
    // https://morioh.com/p/f4d331b62cda
    // https://stackoverflow.com/questions/53772331/vue-html-js-how-to-download-a-file-to-browser-using-the-download-tag
    const ret = await axios.get(process.env.API + '/submits/entry/' + relpath, {
      responseType: 'blob'
    })
    console.log('submitAPI getFile GOT', ret)
    return ret
  }

  /// //////////
  // DELETE entry
  async deleteEntry(entryid) {
    console.log('submitAPI deleteEntry')
    const { ok } = await this.$del('/submits/entry/' + entryid)
    return ok
  }
  // PATCH change part of entry

  /// //////////
  // DELETE submit
  async deleteSubmit(submitid) {
    console.log('submitAPI deleteSubmit')
    const { ok } = await this.$del('/submits/' + submitid)
    return ok
  }

  /// //////////
  // PATCH submit title and author
  async changeSubmitTitle(submit, newtitle, newauthor) {
    //console.log('submitAPI changeSubmitTitle', submit.id, newtitle)
    const data = { newtitle, newauthor }
    const { ok } = await this.$patch('/submits/' + submit.id, data)
    return ok
  }

  /// //////////
  // DELETE submit status
  async deleteSubmitStatus(submitstatusid) {
    console.log('submitAPI deleteSubmitStatus', submitstatusid)
    const { ok } = await this.$del('/submits/status/' + submitstatusid)
    return ok
  }

  /// //////////
  // POST new submit status
  async addSubmitStatus(submitid, newstatusid) {
    console.log('submitAPI addSubmitStatus', submitid, newstatusid)
    const data = { newstatusid }
    const { submitstatus } = await this.$postOverride('POST', '/submits/status/' + submitid, data)
    return submitstatus
  }
}
