<template>
  <div>
    <!-- ADMIN STAGE ACCEPTING FOR PUBLICATION FLOW -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else-if="!(pub.isowner || $auth.user.super)">
      You cannot administer this publication flow
    </div>
    <div v-else>
      <HelpAdminFlowAcceptings />
      <Messages :error="error" :message="message" />
      <div class="bg-yellow p-3">
        <strong>{{ flow.name }}:</strong>
        <b-button variant="outline-success" @click="startAddAccepting()" class="ms-1">
          Add accepting
        </b-button>
      </div>
      <b-list-group class="acceptings">
        <b-list-group-item v-for="(accepting, index) in acceptings" :key="index" class="accepting">
          <b-link @clic.prevent="deleteAccepting(accepting)">
            <v-icon icon="times-circle" class="btn-outline-danger" />
          </b-link>
          {{ accepting.flowstagename }} <strong>{{ accepting.opentext }}</strong> {{ accepting.flowstatusname }}
          <b-button variant="link" @click="startEditAccepting(accepting)">
            <v-icon icon="edit" size="2x" class="btn-outline-warning" />
          </b-button>
        </b-list-group-item>
      </b-list-group>
    </div>

    <b-modal v-model="showModal" Id="bv-modal-accepting" size="xl" centered @ok="okAccepting">
      <template #header>
        {{ modaltitle }}
      </template>
      <template #default>
        <form ref="form" @submit.stop.prevent>
          <b-form-group label="Stage" label-for="stage" label-cols-sm="2">
            <b-form-select id="stage" :options="this.availablestages" size="sm" v-model="chosenstage" style="width:auto;">
              <template v-slot:first>
                <b-form-select-option disabled value="0">Select a stage</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
          <b-form-group label="Open" label-for="open" label-cols-sm="2">
            <b-form-checkbox id="open" v-model="chosenopen">
              Open for submissions
            </b-form-checkbox>
          </b-form-group>
          <div>
            If a user's submission needs to be at a certain stage before they can submit this type of entry, select it here:
          </div>
          <b-form-group label="Status" label-for="status" label-cols-sm="2">
            <b-form-select id="status" :options="this.availablestatuses" size="sm" v-model="chosenstatus" style="width:auto;">
              <template v-slot:first>
                <b-form-select-option value="0">No status needed</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
        </form>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="hideModal"> Cancel </b-button>
        <b-button variant="primary" @click="okAccepting"> OK </b-button>
      </template>
    </b-modal>
    <MessageBoxOK ref="okmsgbox" />
    <ConfirmModal ref="confirm" :title="confirmTitle" :message="confirmMessage" :cancelText="confirmCancelText" :confirmText="confirmOKText"
      @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script lang="ts">
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import _ from 'lodash/core'
import api from '~/api'
import modalBoxes from '@/mixins/modalBoxes'

definePageMeta({
  middleware: ["authuser"]
})

export default {
  mixins: [modalBoxes],
  setup() {
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()

    return { miscStore, pubsStore, submitsStore }
  },
  data() {
    return {
      error: '',
      message: '',
      showModal: false,
      modaltitle: 'UNSET',
      availablestages: [],
      availablestatuses: [],
      chosenstage: 0,
      chosenopen: 0,
      chosenstatus: 0,
      accepting: null,
    }
  },
  async mounted() { // Client only
    this.error = ''
    this.message = ''
    await this.pubsStore.clearError()
    await this.submitsStore.clearError()
    await this.pubsStore.fetch()
    await this.submitsStore.fetchpub(this.pubid)
  },
  computed: {
    pubid(): number {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    flowid() {
      const route = useRoute()
      return parseInt(route.params.flowid)
    },
    pub() {
      const pub = this.pubsStore.getPub(this.pubid)
      if (!pub) {
        this.setError('Invalid pubid')
        return false
      }
      this.miscStore.set({ key: 'page-title', value: pub.name })
      this.miscStore.set({ key: 'page-title-suffix', value: 'ADMIN FLOW STATE' })
      return pub
    },
    fatalerror() {
      return ''
    },
    flow() {
      // Get flows and work out follow-on properties
      let flows = this.submitsStore.flows(this.pubid)
      if (!flows) return false
      const flow = _.find(flows, _flow => { return _flow.id === this.flowid })
      return flow
    },
    acceptings() {
      const flow = this.flow

      // Not the best place, but fill availablestages here
      this.availablestages = []
      for (const stage of flow.stages) {
        this.availablestages.push({ value: stage.id, text: stage.name })
      }
      // Not the best place, but fill availablestatuses here
      this.availablestatuses = []
      for (const status of flow.statuses) {
        this.availablestatuses.push({ value: status.id, text: status.status })
      }

      const acceptings = flow.acceptings
      for (const accepting of acceptings) {
        accepting.opentext = accepting.open ? 'OPEN FOR SUBMISSIONS' : 'NOT OPEN FOR SUBMISSIONS'

        accepting.flowstagename = 'NOT-FOUND'
        const stage = _.find(flow.stages, _stage => { return _stage.id === accepting.flowstageId })
        if (stage) accepting.flowstagename = stage.name

        accepting.flowstatusname = ""
        if (accepting.flowstatusId) {
          const status = _.find(flow.statuses, _status => { return _status.id === accepting.flowstatusId })
          if (status) accepting.flowstatusname = 'IF AT STATUS ' + status.status
          else accepting.flowstatusname = 'IF AT: STATUS NOT FOUND: ' + accepting.flowstatusId
        }
      }
      return acceptings
    },
  },
  methods: {
    setError(msg) {
      this.error = msg
    },
    setMessage(msg) {
      this.message = msg
    },
    startAddAccepting() {
      this.modaltitle = 'Add accepting'
      this.acceptingid = 0
      this.chosenstage = 0
      this.chosenopen = false
      this.chosenstatus = 0
      this.showModal = true
    },
    startEditAccepting(accepting) {
      this.modaltitle = 'Edit accepting'
      this.acceptingid = accepting.id
      this.chosenstage = accepting.flowstageId
      this.chosenopen = accepting.open
      this.chosenstatus = accepting.flowstatusId || 0
      this.showModal = true
    },
    hideModal() {
      this.showModal = false
    },
    async okAccepting() {
      try {
        //console.log('okAccepting', this.chosenstage, this.chosenopen, this.chosenstatus)

        if (this.chosenstage === 0) return this.msgBoxOk('Please choose a stage')

        const ok = await api.acceptings.addEditAccepting(this.flowid, this.acceptingid, this.chosenstage, this.chosenopen, this.chosenstatus)
        if (ok) {
          await this.submitsStore.fetchpub(this.pubid)
          this.$nextTick(() => {
            this.showModal = false
            this.msgBoxOk('Accepting added/edited')
          })
        } else {
          this.msgBoxOk('Accepting could not be added/edited', { title: 'FAIL', headerBgVariant: 'warning' })
        }
      } catch (e) {
        this.msgBoxOk('Error adding/editing accepting: ' + e.message)
      }
    },
    async deleteAccepting(accepting: any) {
      this.accepting = accepting
      this.showConfirm(accepting.flowstagename, "Are you sure you want to delete this accepting?", this.confirmedDeleteAccepting)
    },

    async confirmedDeleteAccepting() {
      try {
        const ok = await api.acceptings.deleteAccepting(this.flowid, this.accepting.id)
        if (ok) {
          await this.submitsStore.fetchpub(this.pubid)
          this.$nextTick(() => {
            this.msgBoxOk('Accepting deleted')
          })
        } else {
          this.msgBoxOk('Accepting could not be deleted', { title: 'FAIL', headerBgVariant: 'warning' })
        }
      } catch (e) {
        this.msgBoxOk('Error deleting accepting: ' + e.message)
      }
    },
  },
}
</script>
