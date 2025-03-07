<template>
  <div>
    <!-- PANEL FOR A SUBMISSION -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else>
      <HelpPanelSubmit />
      <Messages :error="error" :message="message" />
      <div v-if="pub.isowner" class="ps-1 mt-1 mb-1">
        <strong>ADMIN</strong>
        <b-button variant="outline-warning" @click="toggleShowAdminOptions()" class="ms-1">Show/Hide admin options</b-button>
      </div>
      <div class="ps-1">
        Your roles
        <strong v-if="issuper">SUPERADMIN</strong>
        <span v-for="myrole in pub.myroles">
          - {{ myrole.name }}
        </span>
      </div>
      <SubmitSummary :showtype="2" :pub="pub" :flow="flow" :submit="submit" :showingadminoptions="showingadminoptions" :editSubmit="editSubmit"
        :setError="setError" :setMessage="setMessage" />
    </div>

    <SubmitEditModal ref="submitEditModal" :newauthoroptions="newauthoroptions" @confirm="okEdited" />
    <MessageBoxOK ref="okmsgbox" />
    <ConfirmModal ref="confirm" :title="confirmTitle" :message="confirmMessage" :cancelText="confirmCancelText" :confirmText="confirmOKText"
      @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'

import _ from 'lodash/core'
import api from '~/api'
import modalBoxes from '@/mixins/modalBoxes'


export default {
  mixins: [modalBoxes],
  setup() {
    definePageMeta({
      middleware: ["authuser"]
    })
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()

    return { authStore, miscStore, pubsStore, submitsStore }
  },
  data() {
    return {
      error: '',
      message: '',
      showingadminoptions: false,
      submitbeingedited: false,
      newtitle: '',
      newauthor: 0,
      newauthoroptions: [],
      showEditSubmitQuick: false,
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
    issuper() {
      return this.authStore.super
    },
    pubid() {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    flowid() {
      const route = useRoute()
      return parseInt(route.params.flowid)
    },
    submitid() {
      const route = useRoute()
      return parseInt(route.params.submitid)
    },
    fatalerror() {
      const error1 = this.pubsStore.error
      const error2 = this.submitsStore.error
      return error1 ? error2 ? error1 + ". " + error2 : error1 : error2
    },
    pub() {
      const pub = this.pubsStore.getPub(this.pubid)
      if (!pub) {
        this.setError('Invalid pubid')
        return false
      }
      // pub.isowner = true // Do this when testing faked API access restriction
      this.miscStore.set({ key: 'page-title', value: pub.name })
      return pub
    },
    flow() {
      let flows = this.submitsStore.flows(this.pubid)
      if (!flows) flows = []
      const flow = _.find(flows, _flow => { return _flow.id === this.flowid })
      return flow
    },
    submit() {
      const submit = this.submitsStore.submit(this.pubid, this.submitid)
      return submit
    },
  },
  methods: {
    setError(msg) {
      this.error = msg
    },
    setMessage(msg) {
      this.message = msg
    },
    toggleShowAdminOptions() {
      this.showingadminoptions = !this.showingadminoptions
    },

    async editSubmit(submit: any) { // These three methods are also in PublicationSubmissions ie duplicated
      this.newauthoroptions = []
      const { pubusers } = await api.auth.getPubUsers(this.pubid)
      for (const user of pubusers.users) {
        this.newauthoroptions.push({ value: user.id, text: user.username })
      }
      this.submitbeingedited = submit
      this.waitForRef('submitEditModal', async () => {
        this.$refs.submitEditModal.show(submit.name, submit.userId)
      })
    },
    okEdited(newtitle: String, newauthor: Number) {
      try {
        this.newtitle = newtitle.trim()
        if (newtitle.length === 0) return this.msgBoxOk('No new title given!')
        this.newauthor = newauthor
        if (this.newauthor !== this.submitbeingedited.userId) {
          const prev = _.find(this.newauthoroptions, option => { return option.value === this.submitbeingedited.userId })
          const next = _.find(this.newauthoroptions, option => { return option.value === this.newauthor })
          this.showConfirm('Are you sure you want to change the author?', `Change author from ${prev.text} to ${next.text}?`, this.confirmedAuthorChange)
        } else {
          this.confirmedAuthorChange()
        }
      } catch (e) {
        this.msgBoxError('Error changing submit: ' + e.message)
      }
    },
    async confirmedAuthorChange() {
      const newtitle = this.newtitle.trim()
      let newauthor = 0
      if (this.newauthor !== this.submitbeingedited.userId) {
        newauthor = this.newauthor
      }
      const amended = await api.submit.changeSubmitTitle(this.submitbeingedited, newtitle, newauthor)
      if (!amended) return this.msgBoxOk('Error changing submit')
      await this.submitsStore.fetchpub(this.pubid)
      this.$nextTick(() => {
        this.$refs.submitEditModal.hide()
        this.msgBoxOk('Submit changed')
      })
    },
  },
}
</script>
