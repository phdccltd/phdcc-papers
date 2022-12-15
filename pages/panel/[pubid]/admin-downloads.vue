<template>
  <div>
    <!-- ADMIN DOWNLOADS PANEL FOR ONE PUBLICATION -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else-if="!(pub.isowner || issuper)">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdminDownloads />
      <Messages :error="error" :message="message" />
      <b-list-group>
        <b-list-group-item>
          <div class="mb-2">
            <strong>Choose a submission stage:</strong>
            <b-form-select :options="allstages" size="sm" value-field="id" text-field="name" v-model="selectedstage" style="width:auto;">
            </b-form-select>
          </div>
          <b-button variant="success" @click="downloadAnonymousStageSubmissions()" class="me-2">Download anonymised submissions</b-button>
          <b-button variant="success" @click="downloadSummary()" class="me-2">Download summary</b-button>
          <b-button variant="success" @click="downloadAll()">Download all</b-button>
        </b-list-group-item>
        <b-list-group-item>
          <div class="mb-2">
            <strong>Choose one or more grading types:</strong>
            <b-form-select :options="allgrades" size="sm" multiple value-field="id" text-field="name" v-model="selectedgrades" style="width:auto;">
            </b-form-select>
          </div>
          <b-button variant="success" @click="downloadReviewerPerformance()">Download reviewer performance</b-button>
        </b-list-group-item>
      </b-list-group>
    </div>

    <MessageBoxOK ref="okmsgbox" />
    <ConfirmModal ref="confirm" :title="confirmTitle" :message="confirmMessage" :cancelText="confirmCancelText" :confirmText="confirmOKText"
      :okVariant="okVariant" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMailTemplatesStore } from '~/stores/mailtemplates'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSitePagesStore } from '~/stores/sitepages'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import _ from 'lodash/core'
import api from '~/api'
import modalBoxes from '@/mixins/modalBoxes'

definePageMeta({
  middleware: 'authuser',
})

export default {
  mixins: [modalBoxes],
  setup() {
    const authStore = useAuthStore()
    const mailTemplatesStore = useMailTemplatesStore()
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()
    const sitepagesStore = useSitePagesStore()
    const usersStore = useUsersStore()

    return { authStore, mailTemplatesStore, miscStore, pubsStore, sitepagesStore, submitsStore, usersStore }
  },
  data() {
    return {
      error: '',
      message: '',
      selectedstage: 0,
      selectedgrades: [],
    }
  },
  async mounted() { // Client only
    this.error = ''
    this.message = ''
    await this.pubsStore.clearError()
    await this.pubsStore.fetch()
    await this.submitsStore.fetchpub(this.pubid)
  },
  computed: {
    pub() {
      const pub = this.pubsStore.getPub(this.pubid)
      if (!pub) {
        this.setError('Invalid pubid')
        return false
      }
      this.miscStore.set({ key: 'page-title', value: pub.name })
      this.miscStore.set({ key: 'page-title-suffix', value: 'ADMIN SEND EMAIL' })
      return pub
    },
    fatalerror() {
      //const error1 = this.$store.getters['users/error']
      return false
    },
    pubid() {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    allstages() {
      const allstages = []
      const flows = this.submitsStore.flows(this.pubid)
      for (const flow of flows) {
        for (const flowstage of flow.stages) {
          allstages.push(flowstage)
        }
      }
      return allstages
    },
    allgrades() {
      const allgrades = []
      const flows = this.submitsStore.flows(this.pubid)
      for (const flow of flows) {
        for (const flowgrade of flow.flowgrades) {
          allgrades.push(flowgrade)
        }
      }
      return allgrades
    },
    issuper() {
      return this.authStore.super
    },
  },
  methods: {
    /* ************************ */
    setError(msg) {
      this.error = msg
    },
    /* ************************ */
    setMessage(msg) {
      this.message = msg
    },
    /* ************************ */
    async downloadAnonymousStageSubmissions() {
      try {
        if (this.selectedstage == 0) return this.msgBoxOk('No stage chosen!')

        this.message = 'Please wait...'
        const ret = await api.downloads.downloadAnonymousStageSubmissions(this.pubid, this.selectedstage)
        this.handleDownloadReturn(ret)
      } catch (e) {
        this.msgBoxOk('Error downloading: ' + e.message)
      }
    },
    async downloadSummary() {
      try {
        if (this.selectedstage == 0) return this.msgBoxOk('No stage chosen!')

        this.message = 'Please wait...'
        const ret = await api.downloads.downloadSummary(this.pubid, this.selectedstage)
        this.handleDownloadReturn(ret)
      } catch (e) {
        this.msgBoxOk('Error downloading: ' + e.message)
      }
    },
    async downloadAll() {
      if (this.selectedstage == 0) return this.msgBoxOk('No stage chosen!')

      this.message = 'Please wait...'
      const ret = await api.downloads.downloadAll(this.pubid, this.selectedstage)
      this.handleDownloadReturn(ret)
    },
    async downloadReviewerPerformance() {
      if (this.selectedgrades.length == 0) return this.msgBoxOk('No grade(s) chosen!')

      this.message = 'Please wait...'
      const ret = await api.downloads.downloadReviewerPerformance(this.pubid, this.selectedgrades)
      this.handleDownloadReturn(ret)
    },
    basename(thepath?: string) {
      if (thepath == null) return ''
      const lastslash = thepath.lastIndexOf('/')
      return lastslash === -1 ? thepath : thepath.substring(lastslash + 1)
    },
    handleDownloadReturn(ret) {
      if (ret.data.type == 'application/json') {
        const reader = new FileReader();
        reader.addEventListener('loadend', async (e) => {
          const text = e.srcElement.result;
          const rv = JSON.parse(text)
          if ('status' in rv) {
            this.msgBoxOk('Error: ' + rv.status)
          }
          this.message = ''
        });
        reader.readAsText(ret.data)
        return
      }
      let filename = 'anonymised.txt'
      if ('content-disposition' in ret.headers) { // attachment; filename="thename.ext"
        const cd = ret.headers['content-disposition']
        const dqpos = cd.indexOf('"')
        if (dqpos !== -1) {
          filename = cd.substring(dqpos + 1, cd.length - 1)
        }
      }
      const blob = new Blob([ret.data], { type: ret.data.type })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = this.basename(filename)
      link.click()
      URL.revokeObjectURL(link.href)
      this.message = ''
    },
  },
}
</script>
