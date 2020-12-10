<template>
  <!-- ADMIN DOWNLOADS PANEL FOR ONE PUBLICATION -->
  <!-- Access check: correctly fails as API returns error if not allowed -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else-if="!pub.isowner">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdminDownloads />
      <Messages :error="error" :message="message" />

      <b-list-group>
        <b-list-group-item>
          <div class="mb-2">
            <strong>Choose a submission stage:</strong>
            <b-form-select :options="allstages"
                           size="sm"
                           value-field="id"
                           text-field="name"
                           v-model="selectedstage"
                           style="width:auto;">
            </b-form-select>
          </div>
          <b-btn variant="success" @click="downloadAnonymousStageSubmissions()">Download anonymised submissions</b-btn>
          <b-btn variant="success" @click="downloadSummary()">Download summary</b-btn>
          <b-btn variant="success" @click="downloadAll()">Download all</b-btn>
        </b-list-group-item>
        <b-list-group-item>
          <div class="mb-2">
            <strong>Choose a grading type:</strong>
            <b-form-select :options="allgrades"
                           size="sm"
                           value-field="id"
                           text-field="name"
                           v-model="selectedgrade"
                           style="width:auto;">
            </b-form-select>
          </div>
          <b-btn variant="success" @click="downloadReviewerPerformance()">Download reviewer performance</b-btn>
        </b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>

<script>
  const path = require('path')
  const _ = require('lodash/core')
  import HelpAdminDownloads from '~/components/HelpAdminDownloads'
  import Messages from '~/components/Messages'
  
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { Messages, HelpAdminDownloads },
    data({ app, params, store }) {
      return {
        error: '',
        message: '',
        selectedstage: 0,
        selectedgrade: 0,
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      this.$store.dispatch('pubs/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('submits/fetchpub', this.pubid)
    },
    computed: {
      pub() {
        const pub = this.$store.getters['pubs/getPub'](this.pubid)
        if (!pub) {
          this.setError('Invalid pubid')
          return false
        }
        page.title = pub.name
        document.title = pub.name
        this.$store.commit("page/setTitle", page.title)
        this.$store.commit("page/setTitleSuffix", 'ADMIN DOWNLOADS')
        return pub
      },
      fatalerror() {
        //const error1 = this.$store.getters['users/error']
        return false
      },
      pubid() {
        //console.log('PUB pubid')
        return parseInt(this.$route.params.pubid)
      },
      allstages() {
        const allstages = []
        const flows = this.$store.getters['submits/flows'](this.pubid)
        for (const flow of flows) {
          for (const flowstage of flow.stages) {
            allstages.push(flowstage)
          }
        }
        return allstages
      },
      allgrades() {
        const allgrades = []
        const flows = this.$store.getters['submits/flows'](this.pubid)
        for (const flow of flows) {
          for (const flowgrade of flow.flowgrades) {
            allgrades.push(flowgrade)
          }
        }
        return allgrades
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
          if (this.selectedstage == 0) return await this.$bvModal.msgBoxOk('No stage chosen!')

          const ret = await this.$api.downloads.downloadAnonymousStageSubmissions(this.pubid, this.selectedstage)
          this.handleDownloadReturn(ret)
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error downloading: ' + e.message)
        }
      },
      async downloadSummary() {
        try {
          if (this.selectedstage == 0) return await this.$bvModal.msgBoxOk('No stage chosen!')

          const ret = await this.$api.downloads.downloadSummary(this.pubid, this.selectedstage)
          this.handleDownloadReturn(ret)
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error downloading: ' + e.message)
        }
      },
      async downloadAll() {
        if (this.selectedstage == 0) return await this.$bvModal.msgBoxOk('No stage chosen!')

        const ret = await this.$api.downloads.downloadAll(this.pubid, this.selectedstage)
        this.handleDownloadReturn(ret)
      },
      async downloadReviewerPerformance() {
        await this.$bvModal.msgBoxOk('NOT IMPLEMENTED', { title: 'HOLD ON', headerBgVariant: 'warning' })
      },
      handleDownloadReturn(ret) {
        if (ret.data.type == 'application/json') {
          const reader = new FileReader();
          reader.addEventListener('loadend', async (e) => {
            const text = e.srcElement.result;
            const rv = JSON.parse(text)
            if ('status' in rv) {
              await this.$bvModal.msgBoxOk('Error: ' + rv.status)
            }
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
        link.download = path.basename(filename)
        link.click()
        URL.revokeObjectURL(link.href)
      },
    },
    /* ************************ */
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
