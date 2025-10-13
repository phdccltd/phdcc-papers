<template>
  <div>
    <!-- ADMIN STAGE ACCEPTING FOR PUBLICATION FLOW -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
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
          <b-link @click.prevent="deleteAccepting(accepting)">
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
          <b-form-group label="Stage" label-for="stage" label-cols-sm="2" :state="true">
            <b-form-select id="stage" :options="availablestages" size="sm" v-model="chosenstage" style="width:auto;">
              <template v-slot:first>
                <b-form-select-option disabled value="0">Select a stage</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
          <b-form-group label="Open" label-for="open" label-cols-sm="2" :state="true">
            <b-form-checkbox id="open" v-model="chosenopen">
              Open for submissions
            </b-form-checkbox>
          </b-form-group>
          <div>
            If a user's submission needs to be at a certain stage before they can submit this type of entry, select it here:
          </div>
          <b-form-group label="Status" label-for="status" label-cols-sm="2" :state="true">
            <b-form-select id="status" :options="availablestatuses" size="sm" v-model="chosenstatus" style="width:auto;">
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
    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
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
const showModal = ref(false)
const modaltitle = ref('UNSET')
const availablestages = ref<any[]>([])
const availablestatuses = ref<any[]>([])
const chosenstage = ref(0)
const chosenopen = ref(0)
const chosenstatus = ref(0)
const accepting = ref<any>(null)
const acceptingid = ref(0)

onMounted(async () => { // Client only
  error.value = ''
  message.value = ''
  await pubsStore.clearError()
  await submitsStore.clearError()
  await pubsStore.fetch()
  await submitsStore.fetchpub(pubid.value)
})

const pubid = computed((): number => {
  const route = useRoute()
  return parseInt(route.params.pubid as string)
})

const flowid = computed(() => {
  const route = useRoute()
  return parseInt(route.params.flowid as string)
})

const pub = computed(() => {
  const pub = pubsStore.getPub(pubid.value)
  if (!pub) {
    setError('Invalid pubid')
    return false
  }
  miscStore.set({ key: 'page-title', value: pub.name })
  miscStore.set({ key: 'page-title-suffix', value: 'ADMIN FLOW STATE' })
  return pub
})

const fatalerror = computed(() => {
  return ''
})

const flow = computed(() => {
  // Get flows and work out follow-on properties
  let flows = submitsStore.flows(pubid.value)
  if (!flows) return false
  const flow = _.find(flows, _flow => { return _flow.id === flowid.value })
  return flow
})

const acceptings = computed(() => {
  const flowValue = flow.value

  // Not the best place, but fill availablestages here
  availablestages.value = []
  for (const stage of flowValue.stages) {
    availablestages.value.push({ value: stage.id, text: stage.name })
  }
  // Not the best place, but fill availablestatuses here
  availablestatuses.value = []
  for (const status of flowValue.statuses) {
    availablestatuses.value.push({ value: status.id, text: status.status })
  }

  const acceptings = flowValue.acceptings
  for (const accepting of acceptings) {
    accepting.opentext = accepting.open ? 'OPEN FOR SUBMISSIONS' : 'NOT OPEN FOR SUBMISSIONS'

    accepting.flowstagename = 'NOT-FOUND'
    const stage = _.find(flowValue.stages, _stage => { return _stage.id === accepting.flowstageId })
    if (stage) accepting.flowstagename = stage.name

    accepting.flowstatusname = ""
    if (accepting.flowstatusId) {
      const status = _.find(flowValue.statuses, _status => { return _status.id === accepting.flowstatusId })
      if (status) accepting.flowstatusname = 'IF AT STATUS ' + status.status
      else accepting.flowstatusname = 'IF AT: STATUS NOT FOUND: ' + accepting.flowstatusId
    }
  }
  return acceptings
})

function setError(msg: string) {
  error.value = msg
}

function setMessage(msg: string) {
  message.value = msg
}

function startAddAccepting() {
  modaltitle.value = 'Add accepting'
  acceptingid.value = 0
  chosenstage.value = 0
  chosenopen.value = false
  chosenstatus.value = 0
  showModal.value = true
}

function startEditAccepting(acceptingParam: any) {
  modaltitle.value = 'Edit accepting'
  acceptingid.value = acceptingParam.id
  chosenstage.value = acceptingParam.flowstageId
  chosenopen.value = acceptingParam.open
  chosenstatus.value = acceptingParam.flowstatusId || 0
  showModal.value = true
}

function hideModal() {
  showModal.value = false
}

async function okAccepting() {
  try {
    //console.log('okAccepting', chosenstage.value, chosenopen.value, chosenstatus.value)

    if (chosenstage.value === 0) return msgBoxOk('Please choose a stage')

    const ok = await api.acceptings.addEditAccepting(flowid.value, acceptingid.value, chosenstage.value, chosenopen.value, chosenstatus.value)
    if (ok) {
      await submitsStore.fetchpub(pubid.value)
      nextTick(() => {
        showModal.value = false
        msgBoxOk('Accepting added/edited')
      })
    } else {
      msgBoxFail('Accepting could not be added/edited')
    }
  } catch (e: any) {
    msgBoxError('Error adding/editing accepting: ' + e.message)
  }
}

async function deleteAccepting(acceptingParam: any) {
  accepting.value = acceptingParam
  showConfirm(acceptingParam.flowstagename, "Are you sure you want to delete this accepting?", confirmedDeleteAccepting)
}

async function confirmedDeleteAccepting() {
  try {
    const ok = await api.acceptings.deleteAccepting(flowid.value, accepting.value.id)
    if (ok) {
      await submitsStore.fetchpub(pubid.value)
      nextTick(() => {
        msgBoxOk('Accepting deleted')
      })
    } else {
      msgBoxFail('Accepting could not be deleted')
    }
  } catch (e: any) {
    msgBoxError('Error deleting accepting: ' + e.message)
  }
}
</script>
