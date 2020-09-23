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

      <b-list-group class="pubusers">
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
          <b-btn variant="success" @click="downloadAnonymousGradings()">Download anonymous gradings</b-btn>
          <b-btn variant="success" @click="downloadAnonymousGradings()">Download reviewer performance</b-btn>
        </b-list-group-item>
        <b-list-group-item>
          <b-btn variant="success" @click="downloadAnonymousGradings()">Download summary</b-btn>
        </b-list-group-item>
        <b-list-group-item>
          <b-btn variant="success" @click="downloadAnonymousGradings()">Download all</b-btn>
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
      async downloadAnonymousGradings() {
        console.log('DOWNLOAD ANON', this.selectedgrade)
        try {
          if (this.selectedgrade == 0) return await this.$bvModal.msgBoxOk('No grading chosen!')

          const ret = await this.$api.downloads.downloadAnonymousGradings(this.pubid, this.selectedgrade)
          let filename = 'anonymised.txt'
          if ('content-disposition' in ret.headers) {
            // attachment; filename="anonymised.txt"
            const cd = ret.headers['content-disposition']
            const dqpos = cd.indexOf('"')
            if (dqpos !== -1) {
              filename = cd.substring(dqpos+1,cd.length-1)
            }
          }
          const blob = new Blob([ret.data], { type: ret.data.type })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = path.basename(filename)
          link.click()
          URL.revokeObjectURL(link.href)
      } catch (e) {
          this.$bvModal.msgBoxOk('Error downloading: ' + e.message)
        }
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
