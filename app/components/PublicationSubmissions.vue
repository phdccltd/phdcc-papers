<template>
  <div>
    <!-- Main code to display submits etc for a publication, ie for all flows -->
    <!-- Displays all the submits that a user can see ie those they've written and those they can grade - or all for owners -->
    <div v-if="pub.isowner || issuper" class="ps-1 mt-1 mb-1">
      <strong>ADMIN</strong>
      <b-button variant="outline-danger" class="float-end" :to="'/panel/' + pubid + '/admin-setup'" data-cy="pubsub-admin-setup">Setup</b-button>
      <b-badge v-if="!pub.enabled" pill variant="danger" class="float-end m-2">DISABLED FOR USERS</b-badge>
      <b-button variant="outline-warning" @click="toggleShowAdminOptions()" class="ms-2" data-cy="pubsub-admin-options">Show/Hide admin
        options</b-button>
      <b-button v-if="showingadminoptions" variant="outline-success" :to="'/panel/' + pubid + '/admin-users'" class="ms-2"
        data-cy="pubsub-admin-users">Users</b-button>
      <b-button v-if="showingadminoptions" variant="outline-success" :to="'/panel/' + pubid + '/admin-bulk'" class="ms-2"
        data-cy="pubsub-admin-bulk">Bulk</b-button>
      <b-button v-if="showingadminoptions" variant="outline-success" :to="'/panel/' + pubid + '/admin-mail-templates'" class="ms-2"
        data-cy="pubsub-admin-mailtemplates">Mail
        templates
      </b-button>
      <b-button v-if="showingadminoptions" variant="outline-success" :to="'/panel/' + pubid + '/admin-mail'" class="ms-2"
        data-cy="pubsub-admin-emails">Send email</b-button>
      <b-button v-if="showingadminoptions" variant="outline-success" :to="'/panel/' + pubid + '/admin-downloads'" class="ms-2"
        data-cy="pubsub-admin-downloads">Downloads
      </b-button>
    </div>
    <div class="ps-1">
      Your roles
      <strong v-if="issuper">SUPERADMIN</strong>
      <span v-for="myrole in pub.myroles">
        - {{ myrole.name }}
      </span>
    </div>
    <b-list-group class="flows">
      <b-list-group-item v-for="(flow, index) in flows" :key="index" class="flow">
        <h2 class="bg-yellow clearfix">
          <b-button variant="link" @click="toggleFlowShow(flow)">
            <v-icon v-if="flow.visible" icon="minus-square" size="2x" class="btn-outline-warning" />
            <v-icon v-if="!flow.visible" icon="plus-square" size="2x" class="btn-outline-warning" />
          </b-button>
          {{ flow.name }}
          <span v-for="flowaction in flow.actions">
            <b-button class="float-end me-2" variant="outline-success" :to="flowaction.route" :data-cy="'pubsub-flow-action-' + flow.id">{{
              flowaction.name }}</b-button>
          </span>
          <b-button class="float-end me-2" v-if="pub.isowner && showingadminoptions" variant="outline-success"
            :to="'/panel/' + pubid + '/' + flow.id + '/admin-flow-acceptings'" :data-cy="'pubsub-flow-status-' + flow.id">Stage status</b-button>
        </h2>
        <b-list-group v-if="flow.visible" class="flows">
          <p class="m-1">{{ flow.description }}</p>
          <b-list-group-item v-for="(submit, index) in flow.filteredsubmits" :key="index" :class="'submit ' + (submit.ismine ? '' : 'submitnotmine')">
            <SubmitSummary :showtype="1" :pub="pub" :flow="flow" :submit="submit" :showingadminoptions="showingadminoptions" :editSubmit="editSubmit"
              :setError="setError" :setMessage="setMessage" />
          </b-list-group-item>
        </b-list-group>
      </b-list-group-item>
    </b-list-group>
    <div v-if="noflows" class="mt-2">
      <strong>No submission workflows yet</strong>
    </div>
    <div v-if="nowtavailable" class="mt-2">
      <strong>Nothing submitted yet</strong>
    </div>

    <SubmitEditModal v-if="showSubmitEditModal" :newauthoroptions="newauthoroptions" :newtitle="newtitle" :newauthor="newauthor" @confirm="okEdited"
      @hidden="showSubmitEditModal = false" />
    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import _ from 'lodash/core'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

const props = defineProps({
  flowid: { type: Number, required: false, default: 0, },
  setError: { type: Function, required: true, },
  setMessage: { type: Function, required: true, },
})

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()

const noflows = ref(false)
const nowtavailable = ref(false)
const showingadminoptions = ref(false)
const submitbeingedited = ref<any>(false)
const newtitle = ref('')
const newauthor = ref(0)
const newauthoroptions = ref([])
const showSubmitEditModal = ref(false)

const pubid = computed(() => {
  const route = useRoute()
  return parseInt(route.params.pubid as string)
})

const pub = computed(() => {
  const pub = pubsStore.getPub(pubid.value)
  if (!pub) {
    props.setError('Invalid pubid')
    return false
  }
  // pub.isowner = true // Do this when testing faked API access restriction
  miscStore.set({ key: 'page-title', value: pub.name })
  return pub
})

const flows = computed(() => {
  //console.log('PUB flows', pubid.value)
  // Get flows and work out follow-on properties
  let flows = submitsStore.flows(pubid.value)
  if (!flows) flows = []
  // Set starter addtype and get countsubmits
  const filteredflows = []
  let countsubmits = 0
  for (const flow of flows) {
    //let anysubmithidden = false
    if (!props.flowid || props.flowid === flow.id) filteredflows.push(flow)

    flow.filteredsubmits = []
    for (const fsubmit of flow.submits) {
      const submit = submitsStore.submit(pubid.value, fsubmit.id)
      flow.filteredsubmits.push(submit)
      //if (!submit.visible) anysubmithidden = true

      for (const entry of submit.entries) {
        entry.stage = _.find(flow.stages, stage => { return stage.id === entry.flowstageId })
      }
    }
    countsubmits += flow.submits.length
  }
  noflows.value = flows.length === 0
  nowtavailable.value = !noflows.value && countsubmits === 0
  return filteredflows
})

const issuper = computed(() => {
  return authStore.super
})

const isowner = computed(() => {
  return authStore.super
})

const toggleShowAdminOptions = () => {
  showingadminoptions.value = !showingadminoptions.value
}

const toggleFlowShow = (flow: any) => {
  console.log('toggleFlowShow', flow.visible)
  flow.visible = !flow.visible
}

const editSubmit = async (submit: any) => { // These three methods are also in \panel\_pubid\_flowid\_submitid\index.vue ie duplicated
  try {
    newauthoroptions.value = []
    const { pubusers } = await api.auth.getPubUsers(pubid.value)
    for (const user of pubusers.users) {
      newauthoroptions.value.push({ value: user.id, text: user.username })
    }
    submitbeingedited.value = submit
    newtitle.value = submit.name
    newauthor.value = submit.userId
    showSubmitEditModal.value = true
  } catch (e: any) {
    console.log("editSubmit:", e.message)
  }
}

const okEdited = (newtitleParam: string, newauthorParam: number) => {
  try {
    newtitle.value = newtitleParam.trim()
    if (newtitleParam.length === 0) return msgBoxOk('No new title given!')
    newauthor.value = newauthorParam
    if (newauthor.value !== submitbeingedited.value.userId) {
      const prev = _.find(newauthoroptions.value, option => { return option.value === submitbeingedited.value.userId })
      const next = _.find(newauthoroptions.value, option => { return option.value === newauthor.value })
      showConfirm('Are you sure you want to change the author?', `Change author from ${prev.text} to ${next.text}?`, confirmedAuthorChange)
    } else {
      confirmedAuthorChange()
    }
  } catch (e: any) {
    msgBoxError('Error changing submit: ' + e.message)
  }
}

const confirmedAuthorChange = async () => {
  const newtitleTrimmed = newtitle.value.trim()
  let newauthorValue = 0
  if (newauthor.value !== submitbeingedited.value.userId) {
    newauthorValue = newauthor.value
  }
  const amended = await api.submit.changeSubmitTitle(submitbeingedited.value, newtitleTrimmed, newauthorValue)
  if (!amended) return msgBoxOk('Error changing submit')
  await submitsStore.fetchpub(pubid.value)
  showSubmitEditModal.value = false
  msgBoxOk('Submit changed')
}
</script>
<style>
.status {
  font-weight: bold;
  color: green;
}
</style>