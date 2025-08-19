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

    <SubmitEditModal v-if="showSubmitEditModal" :newauthoroptions="newauthoroptions" :newtitle="newtitle" :newauthor="newauthor" @confirm="okEdited" @hidden="showSubmitEditModal = false" />
    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'

import _ from 'lodash/core'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

definePageMeta({
  middleware: ["authuser"]
})

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()

const error = ref('')
const message = ref('')
const showingadminoptions = ref(false)
const submitbeingedited = ref<any>(false)
const newtitle = ref('')
const newauthor = ref(0)
const newauthoroptions = ref<any[]>([])
const showEditSubmitQuick = ref(false)
const showSubmitEditModal = ref(false)

onMounted(async () => { // Client only
  error.value = ''
  message.value = ''
  await pubsStore.clearError()
  await submitsStore.clearError()
  await pubsStore.fetch()
  await submitsStore.fetchpub(pubid.value)
})

const issuper = computed(() => {
  return authStore.super
})

const pubid = computed(() => {
  const route = useRoute()
  return parseInt(route.params.pubid as string)
})

const flowid = computed(() => {
  const route = useRoute()
  return parseInt(route.params.flowid as string)
})

const submitid = computed(() => {
  const route = useRoute()
  return parseInt(route.params.submitid as string)
})

const fatalerror = computed(() => {
  const error1 = pubsStore.error
  const error2 = submitsStore.error
  return error1 ? error2 ? error1 + ". " + error2 : error1 : error2
})

const pub = computed(() => {
  const pub = pubsStore.getPub(pubid.value)
  if (!pub) {
    setError('Invalid pubid')
    return false
  }
  // pub.isowner = true // Do this when testing faked API access restriction
  miscStore.set({ key: 'page-title', value: pub.name })
  return pub
})

const flow = computed(() => {
  let flows = submitsStore.flows(pubid.value)
  if (!flows) flows = []
  const flow = _.find(flows, _flow => { return _flow.id === flowid.value })
  return flow
})

const submit = computed(() => {
  const submit = submitsStore.submit(pubid.value, submitid.value)
  return submit
})

function setError(msg: string) {
  error.value = msg
}

function setMessage(msg: string) {
  message.value = msg
}

function toggleShowAdminOptions() {
  showingadminoptions.value = !showingadminoptions.value
}

async function editSubmit(submit: any) { // These three methods are also in PublicationSubmissions ie duplicated
  newauthoroptions.value = []
  const { pubusers } = await api.auth.getPubUsers(pubid.value)
  for (const user of pubusers.users) {
    newauthoroptions.value.push({ value: user.id, text: user.username })
  }
  submitbeingedited.value = submit
  newtitle.value = submit.name
  newauthor.value = submit.userId
  showSubmitEditModal.value = true
}

function okEdited(newtitleParam: string, newauthorParam: number) {
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

async function confirmedAuthorChange() {
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
