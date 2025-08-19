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
            <b-form-group label="Choose a submission status to move FROM:" label-for="fromid" label-cols-sm="5" :state="true">
              <b-form-select :options="allstatuses" id="fromid" size="sm" v-model="fromstatus" style="width:auto;">
              </b-form-select>
            </b-form-group>
            <b-form-group label="Choose a submission status to move TO:" label-for="toid" label-cols-sm="5" :state="true">
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

    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSitePagesStore } from '~/stores/sitepages'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

definePageMeta({
  middleware: 'authuser',
})

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const sitepagesStore = useSitePagesStore()
const usersStore = useUsersStore()

const error = ref('')
const message = ref('')
const fromstatus = ref(0)
const tostatus = ref(0)
const lastfrom = ref(0)
const lastto = ref(0)
const confirmed = ref('')

onMounted(async () => { // Client only
  error.value = ''
  message.value = ''
  await pubsStore.clearError()
  await pubsStore.fetch()
  await submitsStore.fetchpub(pubid.value)
})

const pub = computed(() => {
  const pub = pubsStore.getPub(pubid.value)
  if (!pub) {
    setError('Invalid pubid')
    return false
  }
  miscStore.set({ key: 'page-title', value: pub.name })
  miscStore.set({ key: 'page-title-suffix', value: 'ADMIN BULK OPS' })
  return pub
})

const fatalerror = computed(() => {
  return false
})

const pubid = computed(() => {
  const route = useRoute()
  return parseInt(route.params.pubid as string)
})

const allstatuses = computed(() => {
  const options: any[] = []
  const flows = submitsStore.flows(pubid.value)
  for (const flow of flows) {
    for (const flowstatus of flow.statuses) {
      options.push({ value: flowstatus.id, text: flowstatus.status })
    }
  }
  return options
})

const issuper = computed(() => {
  return authStore.super
})

function setError(msg: string) {
  error.value = msg
}

function setMessage(msg: string) {
  message.value = msg
}

async function moveToNewStatus() {
  try {
    message.value = ''
    error.value = ''
    if (fromstatus.value === 0) return msgBoxOk('No FROM status chosen!')
    if (tostatus.value === 0) return msgBoxOk('No TO status chosen!')
    if (fromstatus.value === tostatus.value) return msgBoxOk('No change requested!')

    if ((fromstatus.value !== lastfrom.value) || (tostatus.value !== lastto.value)) confirmed.value = ''
    lastfrom.value = fromstatus.value
    lastto.value = tostatus.value

    let countAtFromStatus = 0
    const flows = submitsStore.flows(pubid.value)
    for (const flow of flows) {
      for (const submit of flow.submits) {
        if (submit.statuses.length > 0) {
          const status0 = submit.statuses[0]
          if (status0.flowstatusId === fromstatus.value) {
            countAtFromStatus++
          }
        }
      }
    }
    if (!confirmed.value) {
      confirmed.value = 'Number to do: ' + countAtFromStatus
      if (countAtFromStatus > 0) confirmed.value += '. Click again to confirm:'
      return
    }
    if (countAtFromStatus === 0) return msgBoxOk('Nothing to do')
    confirmed.value = 'Please wait...'

    const status = await api.pubs.bulkSubmitStatusUpdate(pubid.value, fromstatus.value, tostatus.value)
    if (status) {
      message.value = status
    } else {
      error.value = 'Failed to add statuses'
    }
    confirmed.value = ''
    await submitsStore.fetchpub(pubid.value)
  } catch (e: any) {
    msgBoxError('Error moving to status: ' + e.message)
  }
}
</script>
