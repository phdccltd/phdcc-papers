<template>
  <div>
    <!-- ADMIN BULK PANEL FOR ONE PUBLICATION -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else-if="!(pub.isowner || issuper)">
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
            <b-form-group label="Choose a submission status to move FROM:" label-for="fromid" label-cols-sm="5" state="true">
              <b-form-select :options="allstatuses" id="fromid" size="sm" v-model="fromstatus" style="width:auto;">
              </b-form-select>
            </b-form-group>
            <b-form-group label="Choose a submission status to move TO:" label-for="toid" label-cols-sm="5" state="true">
              <b-form-select :options="allstatuses" id="toid" size="sm" v-model="tostatus" style="width:auto;">
              </b-form-select>
            </b-form-group>
            <b-form-row>
              <b-col cols="5" class="font-weight-bold">
                {{ confirmed }}
              </b-col>
              <b-col>
                <b-button variant="success" @click="moveToNewStatus()" data-cy="adminbulk-move">Move submissions to new status</b-button>
              </b-col>
            </b-form-row>
          </div>
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
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSitePagesStore } from '~/stores/sitepages'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import api from '~/api'
import modalBoxes from '@/mixins/modalBoxes'

definePageMeta({
  middleware: 'authuser',
})

export default {
  inject: { setLayoutMessage: {} },
  mixins: [modalBoxes],
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()
    const sitepagesStore = useSitePagesStore()
    const usersStore = useUsersStore()

    return { authStore, miscStore, pubsStore, sitepagesStore, submitsStore, usersStore }
  },
  data() {
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
    this.setLayoutMessage()
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
      this.miscStore.set({ key: 'page-title-suffix', value: 'ADMIN BULK OPS' })
      return pub
    },
    fatalerror() {
      return false
    },
    pubid() {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    allstatuses() {
      const options = []
      const flows = this.submitsStore.flows(this.pubid)
      for (const flow of flows) {
        for (const flowstatus of flow.statuses) {
          options.push({ value: flowstatus.id, text: flowstatus.status })
        }
      }
      return options
    },
    issuper() {
      return this.authStore.super
    },
  },
  methods: {
    setError(msg) {
      this.error = msg
    },
    setMessage(msg) {
      this.message = msg
    },
    async moveToNewStatus() {
      try {
        this.message = ''
        this.error = ''
        if (this.fromstatus === 0) return this.msgBoxOk('No FROM status chosen!')
        if (this.tostatus === 0) return this.msgBoxOk('No TO status chosen!')
        if (this.fromstatus === this.tostatus) return this.msgBoxOk('No change requested!')

        if ((this.fromstatus !== this.lastfrom) || (this.tostatus !== this.lastto)) this.confirmed = ''
        this.lastfrom = this.fromstatus
        this.lastto = this.tostatus

        let countAtFromStatus = 0
        const flows = this.submitsStore.flows(this.pubid)
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
        if (countAtFromStatus === 0) return this.msgBoxOk('Nothing to do')
        this.confirmed = 'Please wait...'

        const status = await api.pubs.bulkSubmitStatusUpdate(this.pubid, this.fromstatus, this.tostatus)
        if (status) {
          this.message = status
        } else {
          this.error = 'Failed to add statuses'
        }
        this.confirmed = ''
        await this.submitsStore.fetchpub(this.pubid)
      } catch (e) {
        this.msgBoxError('Error moving to status: ' + e.message)
      }
    },
  },
}
</script>
