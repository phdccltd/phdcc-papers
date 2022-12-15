import axios from 'axios'

import { useAuthStore } from '~/stores/auth'
import BaseAPI from './BaseAPI'

const runtimeConfig = useRuntimeConfig()

export default class DownloadsAPI extends BaseAPI {
  async downloadAnonymousStageSubmissions (pubid, selectedstage) {
    const authStore = useAuthStore()
    const params = {
      flowstageid: selectedstage
    }
    const ret = await axios.get(runtimeConfig.public.API + '/downloads/anon/' + pubid, {
      params,
      responseType: 'blob',
      headers: {
        'Authorization': 'bearer ' + authStore.authorization,
      }
    })
    return ret
  }

  async downloadSummary (pubid, selectedstage) {
    const authStore = useAuthStore()
    const params = {
      flowstageid: selectedstage
    }
    const ret = await axios.get(runtimeConfig.public.API + '/downloads/summary/' + pubid, {
      params,
      responseType: 'blob',
      headers: {
        'Authorization': 'bearer ' + authStore.authorization,
      }
    })
    return ret
  }

  async downloadAll (pubid, selectedstage) {
    const authStore = useAuthStore()
    const params = {
      flowstageid: selectedstage
    }
    const ret = await axios.get(runtimeConfig.public.API + '/downloads/all/' + pubid, {
      params,
      responseType: 'blob',
      headers: {
        'Authorization': 'bearer ' + authStore.authorization,
      }
    })
    return ret
  }

  async downloadReviewerPerformance (pubid, selectedgrade) {
    const authStore = useAuthStore()
    const params = {
      flowgradeids: selectedgrade.join(',')
    }
    const ret = await axios.get(runtimeConfig.public.API + '/downloads/reviewers/' + pubid, {
      params,
      responseType: 'blob',
      headers: {
        'Authorization': 'bearer ' + authStore.authorization,
      }
    })
    return ret
  }
}
