<template>
  <div>
    <!-- ADMIN SETUP PANEL FOR ONE PUBLICATION -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else-if="!(pub.isowner || issuper)">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdminSetup />
      <Messages :error="error" :message="message" />
      <div class="mb-2">
        <b-badge v-if="!pub.enabled" pill variant="danger">DISABLED FOR USERS</b-badge>
      </div>
      <div>
        <b-button variant="outline-warning" @click="togglePubEnable(pub)">
          {{ pub.enabled ? 'DISABLE' : 'ENABLE' }}
        </b-button>
        <b-button variant="outline-danger" @click="deletePub(pub)" class="float-end">
          DELETE
        </b-button>
      </div>
    </div>

    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMailTemplatesStore } from '~/stores/mailtemplates'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSitePagesStore } from '~/stores/sitepages'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import _ from 'lodash/core'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

definePageMeta({
  middleware: 'authuser',
})

const authStore = useAuthStore()
const mailTemplatesStore = useMailTemplatesStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const sitepagesStore = useSitePagesStore()
const usersStore = useUsersStore()

const error = ref('')
const message = ref('')
const confirmpub = ref<any>(null)

onMounted(async () => { // Client only
  error.value = ''
  message.value = ''
  await pubsStore.clearError()
  await pubsStore.fetch()
})

const pub = computed(() => {
  const pub = pubsStore.getPub(pubid.value)
  if (!pub) {
    setError('Invalid pubid')
    return false
  }
  miscStore.set({ key: 'page-title', value: pub.name })
  miscStore.set({ key: 'page-title-suffix', value: 'ADMIN SETUP' })
  return pub
})

const fatalerror = computed(() => {
  const error1 = usersStore.error
  return error1
})

const pubid = computed(() => {
  const route = useRoute()
  return parseInt(route.params.pubid as string)
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

async function togglePubEnable(pub: any) {
  confirmpub.value = pub
  showConfirm(pub.name, 'Are you sure you want to ' + (pub.enabled ? 'disable' : 'enable') + ' this publication?', confirmTogglePubEnable)
}

async function confirmTogglePubEnable() {
  try {
    const ok = await api.pubs.toggleEnablePub(confirmpub.value.id, !confirmpub.value.enabled)
    if (ok) {
      // pub.enabled = !pub.enabled
      await pubsStore.fetch()
    } else {
      msgBoxFail('Toggling enable went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error toggling enable on publication: ' + e.message)
  }
}

async function deletePub(pub: any) {
  confirmpub.value = pub
  showConfirm(pub.name, 'Are you sure you want to delete this publication? CHECK THAT ALL TRACES REMOVED', confirmDeletePub, null, null, null, 'danger')
}

async function confirmDeletePub() {
  console.log('deletePub')
  try {
    const ok = await api.pubs.deletePub(confirmpub.value.id)
    if (ok) {
      await pubsStore.fetch()
      nextTick(() => {
        navigateTo('/panel')
      })
    } else {
      msgBoxFail('Delete went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error deleting publication: ' + e.message)
  }
}
</script>
