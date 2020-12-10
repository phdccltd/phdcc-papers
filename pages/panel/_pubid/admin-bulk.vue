<template>
  <!-- ADMIN BULK PANEL FOR ONE PUBLICATION -->
  <!-- Access check: correctly fails as API returns error if not allowed -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else-if="!pub.isowner">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdminBulk />
      <Messages :error="error" :message="message" />

      <b-list-group>
        <b-list-group-item>
          <div class="mb-2">
            <p>
              This option will find all submissions at the FROM status and add a new TO status.
            </p>
            <b-form-group label="Choose a submission status to move FROM:" label-for="fromid" label-cols-sm="5">
              <b-form-select :options="allstatuses"
                             id="fromid"
                             size="sm"
                             v-model="fromstatus"
                             style="width:auto;">
              </b-form-select>
            </b-form-group>
            <b-form-group label="Choose a submission status to move TO:" label-for="toid" label-cols-sm="5">
              <b-form-select :options="allstatuses"
                             id="toid"
                             size="sm"
                             v-model="tostatus"
                             style="width:auto;">
              </b-form-select>
            </b-form-group>
            <b-form-row>
              <b-col cols="5" class="font-weight-bold">
                {{confirmed}}
              </b-col>
              <b-col>
                <b-btn variant="success" @click="moveToNewStatus()">Move submissions to new status</b-btn>
              </b-col>
            </b-form-row>
          </div>
        </b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>

<script>
  const path = require('path')
  const _ = require('lodash/core')
  import HelpAdminBulk from '~/components/HelpAdminBulk'
  import Messages from '~/components/Messages'
  
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { Messages, HelpAdminBulk },
    data({ app, params, store }) {
      return {
        error: '',
        message: '',
        fromstatus: 0,
        tostatus: 0,
        lastfrom: 0,
        lastto: 0,
        confirmed: ''
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
        this.$store.commit("page/setTitleSuffix", 'ADMIN BULK OPS')
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
      allstatuses() {
        const options = []
        const flows = this.$store.getters['submits/flows'](this.pubid)
        for (const flow of flows) {
          for (const flowstatus of flow.statuses) {
            options.push({ value: flowstatus.id, text: flowstatus.status })
          }
        }
        return options
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
      async moveToNewStatus() {
        try {
          this.message = ''
          this.error = ''
          if (this.fromstatus === 0) return await this.$bvModal.msgBoxOk('No FROM status chosen!')
          if (this.tostatus === 0) return await this.$bvModal.msgBoxOk('No TO status chosen!')
          if (this.fromstatus === this.tostatus) return await this.$bvModal.msgBoxOk('No change requested!')

          if ((this.fromstatus !== this.lastfrom) || (this.tostatus !== this.lastto)) this.confirmed = ''
          this.lastfrom = this.fromstatus
          this.lastto = this.tostatus

          let countAtFromStatus = 0
          const flows = this.$store.getters['submits/flows'](this.pubid)
          for (const flow of flows) {
            for (const submit of flow.submits) {
              if (submit.statuses.length > 0) {
                const status0 = submit.statuses[0]
                if (status0.flowstatusId === this.fromstatus) {
                  countAtFromStatus++
                }
              }
            }
          }
          if (!this.confirmed) {
            this.confirmed = 'Number to do: ' + countAtFromStatus
            if (countAtFromStatus > 0) this.confirmed += '. Click again to confirm:'
            return
          }
          if (countAtFromStatus === 0) return await this.$bvModal.msgBoxOk('Nothing to do')
          this.confirmed = 'Please wait...'

          const status = await this.$api.pub.bulkSubmitStatusUpdate(this.pubid, this.fromstatus, this.tostatus)
          if (status) {
            this.message = status
          } else {
            this.error = 'Failed to add statuses'
          }
          this.confirmed = ''
          this.$store.dispatch('submits/fetchpub', this.pubid)
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error moving to status: ' + e.message)
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
