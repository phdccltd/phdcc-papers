export class APIError extends Error {
  constructor ({ request, response }, message) {
    super(message)
    Object.assign(this, { request, response })
  }
}

export class LoginError extends Error {
  constructor (ret, status) {
    super(status)
    Object.assign(this, { ret, status })
  }
}

export class SignUpError extends Error {
  constructor (ret, status) {
    super(status)
    Object.assign(this, { ret, status })
  }
}

export default class BaseAPI {
  constructor ({ $axios, store }) {
    this.$axios = $axios
    this.store = store
  }

  async $request (method, path, config, logError = true) {
    // console.log('REQUEST ', method, process.env.API, path)

    let status = null
    let data = null

    try {
      // Don't touch this...
      const ret = await this.$axios.request({
        ...config,
        method,
        url: process.env.API + path
      })
      ;({ status, data } = ret) // eslint-disable-line

      if (!status || !data) {
        // We're investigating some cases, with some evidence of it happening in page unload, where we don't go
        // through the exception handler, but we end up with nothing in status/data.  Throw an exception to trigger
        // a single retry.
        console.log('BaseAPI suspicious return from axios - perhaps cancelled?', ret)
        throw new Error('Axios empty')
      }
    } catch (e) {
      // We have seen exceptions such as "Error: timeout of 0ms exceeded".  These appear to be generated by
      // mobile browsers in response to network errors, and not respect the axios retrying.  But the network can't
      // be that bad if the Sentry reports ever get through.  So do a simple extra retry here.
      console.log('BaseAPI axios error', e)

      if (
        e.message.match(/.*timeout.*/i) ||
        e.message.match(/.*Axios empty.*/i)
      ) {
        console.log('BaseAPI timeout or empty - sleep')
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Timeout.  Try again.  If it fails this time then we will throw another error.
        console.log('BaseAPI timeout or empty - retry')
        const ret = await this.$axios.request({
          ...config,
          method,
          url: process.env.API + path
        });
        ({ status, data } = ret)
      } else if (e.message.match(/.*aborted.*/i)) {
        // We've seen requests get aborted immediately after beforeunload().  Makes sense to abort the requests
        // when you're leaving a page.  No point in rippling those errors up to result in Sentry errors.
        // Swallow these by returning a problem that never resolves.  Possible memory leak but it's a rare case.
        console.log('BaseAPI aborted - ignore')
        return new Promise(function (resolve) {})
      }
      if (!status || !data) {
        status = 400
        data = { ret: 1, status: e.message }
      }
    }

    // HTTP errors are real errors.
    //
    // We've sometimes seen 200 response codes with no returned data (I saw this myself on a train with flaky
    // signal).  So that's an error if it happens.
    //
    // data.ret holds the server error.
    // - 1 means not logged in, and that's ok.
    // - POSTs to session can return errors we want to handle.
    // - 999 can happen if people double-click, and we should just quietly drop it because the first click will
    //   probably do the right thing.
    // - otherwise throw an exception.
    console.log('BaseAPI C', path, status, data.ret, data.status)
    if (
      status !== 200 ||
      !data ||
      (data.ret !== 0 &&
        !(data.ret === 1 && data.status === 'Not logged in') &&
        data.ret !== 999)
    ) {
      const retstr = data && data.ret ? data.ret : 'Unknown'
      const statusstr = data && data.status ? data.status : 'Unknown'

      const message = [
        'API Error',
        method,
        path,
        '->',
        `ret: ${retstr} status: ${statusstr}`
      ].join(' ')

      throw new APIError(
        {
          request: {
            path,
            method,
            headers: config.headers,
            params: config.params,
            data: config.data
          },
          response: {
            status,
            data
          }
        },
        message
      )
    }

    return data
  }

  $get (path, params = {}, logError = true) {
    // console.log('GET ', path)
    return this.$request('GET', path, { params }, logError)
  }

  $post (path, data, logError = true) {
    return this.$request('POST', path, { data }, logError)
  }

  $postOverride (overrideMethod, path, data, logError = true) {
    return this.$request(
      'POST',
      path,
      {
        data,
        headers: {
          'X-HTTP-Method-Override': overrideMethod
        }
      },
      logError
    )
  }

  $put (path, data, logError = true) {
    return this.$postOverride('PUT', path, data, logError)
  }

  $patch (path, data, logError = true) {
    return this.$postOverride('PATCH', path, data, logError)
  }

  $del (path, data, config = {}, logError = true) {
    return this.$postOverride('DELETE', path, data, logError)
  }
}
