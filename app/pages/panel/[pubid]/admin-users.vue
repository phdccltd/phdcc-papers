<template>
  <div>
    <!-- ADMIN USERS PANEL FOR ONE PUBLICATION -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else-if="!(pub.isowner || issuper)">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdminUsers />
      <Messages :error="error" :message="message" />
      <b-row no-gutters class="bg-yellow p-3">
        <b-col sm="6">
          <form ref="form" @submit.stop.prevent>
            Filter:
            <b-form-select :options="pubusers.pubroles" size="sm" value-field="id" text-field="name" v-model="selectedrole" style="width:auto;">
              <template v-slot:first>
                <b-form-select-option selected value="0">All roles</b-form-select-option>
              </template>
            </b-form-select>
          </form>
        </b-col>
        <b-col sm="6">
        </b-col>
      </b-row>
      <b-list-group class="pubusers" data-cy="adminusers-pubusers">
        <div v-for="(pubuser, index) in pubusers.users" :key="index">
          <b-list-group-item class="pubuser" v-if="hasRole(pubuser)">
            <b-row no-gutters>
              <b-col sm="6">
                <b-link @click.prevent="deletePubUser(pubuser)" class="me-2">
                  <v-icon icon="times-circle" class="btn-outline-danger" />
                </b-link>
                <strong>{{ pubuser.id }} {{ pubuser.name }}</strong>
                {{ pubuser.email }}
                <br />
                Submissions: {{ pubuser.submitcount }}
                <b-button v-if="canmasquerade(pubuser)" @click="masquerade(pubuser)" variant="outline-warning" size="sm">Masquerade</b-button>
              </b-col>
              <b-col sm="6">
                <b-button variant="link" class="float-end" @click="startAddUserRole(pubusers, pubuser)">
                  <v-icon icon="plus-circle" class="btn-outline-warning" />
                </b-button>
                <div v-for="(role, index) in pubuser.roles" :key="index" class="pubuserrole">
                  <b-link @click.prevent="deleteUserRole(pubuser, role)">
                    <v-icon icon="times-circle" class="btn-outline-danger" />
                  </b-link>
                  {{ role.name }}
                </div>
              </b-col>
            </b-row>
          </b-list-group-item>
        </div>
      </b-list-group>

    </div>

    <b-modal v-model="showAddRoleModal" id="bv-modal-add-role" title="Add role" centered>
      <template #default>
        <p>Note: adding some roles may send emails, eg Author.</p>
        <form ref="form" @submit.stop.prevent>
          <b-form-group label="user" label-for="addroleusername" label-cols-sm="4" :state="true">
            <b-form-input id="addroleusername" disabled v-model="addroleusername"></b-form-input>
          </b-form-group>
          <b-form-group label="Role" label-for="new-role" label-cols-sm="4" :state="true">
            <b-form-select :options="this.availablenewroles" size="sm" v-model="chosennewrole" style="width:auto;">
              <template v-slot:first>
                <b-form-select-option disabled value="0">Select a role</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
        </form>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="cancelModal"> Cancel </b-button>
        <b-button variant="primary" @click="addUserRole"> OK </b-button>
      </template>
    </b-modal>

    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm"  />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import _ from 'lodash/core'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

definePageMeta({
  middleware: 'authuser',
})

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const usersStore = useUsersStore()

const error = ref('')
const message = ref('')
const selectedrole = ref(0)
const addroleuserid = ref(0)
const addroleusername = ref('')
const chosennewrole = ref(0)
const availablenewroles = ref<any[]>([])
const showAddRoleModal = ref(false)
const confirmpubuser = ref<any>(null)
const confirmrole = ref<any>(null)

onMounted(async () => { // Client only
  error.value = ''
  message.value = ''
  await pubsStore.clearError()
  await pubsStore.fetch()
  await usersStore.clearError()
  await usersStore.fetchpubusers(pubid.value)
})

const pub = computed(() => {
  const pub = pubsStore.getPub(pubid.value)
  if (!pub) {
    setError('Invalid pubid')
    return false
  }
  miscStore.set({ key: 'page-title', value: pub.name })
  miscStore.set({ key: 'page-title-suffix', value: 'ADMIN USERS' })
  return pub
})

const fatalerror = computed(() => {
  return usersStore.error
})

const pubid = computed(() => {
  const route = useRoute()
  return parseInt(route.params.pubid as string)
})

const pubusers = computed(() => {
  const pu = usersStore.pubusers(pubid.value)
  return pu ? pu : {}
})

const issuper = computed(() => {
  return authStore.super
})

function canmasquerade(pubuser: any) {
  return authStore.super && (authStore.id != pubuser.id)
}

function cancelModal() {
  showAddRoleModal.value = false
}

function setError(msg: string) {
  error.value = msg
}

function setMessage(msg: string) {
  message.value = msg
}

function hasRole(pubuser: any) {
  const selectedroleInt = parseInt(selectedrole.value as any)
  if (selectedroleInt === 0) return true
  const hasrole = _.find(pubuser.roles, role => { return role.id === selectedroleInt })
  return hasrole
}

function deletePubUser(pubuser: any) {
  confirmpubuser.value = pubuser
  if (pubuser.id === authStore.id) {
    showConfirm(pubuser.name, 'THIS IS YOU. Do you want to continue?', confirmDeletePubUser, null, null, null, 'danger')
  } else {
    confirmDeletePubUser()
  }
}

function confirmDeletePubUser() {
  showConfirm(confirmpubuser.value.name, 'Are you sure you want to stop this user accessing your publication/conference?  No submissions etc will be removed.', reallyDeletePubUser)
}

async function reallyDeletePubUser() {
  try {
    //console.log('deletePubUser', pubuser.id, authStore.id)
    const ok = await api.auth.removePubUser(pubid.value, confirmpubuser.value.id)
    if (ok) {
      await usersStore.fetchpubusers(pubid.value)
    } else {
      msgBoxFail('User could not be removed')
    }
  } catch (e: any) {
    msgBoxError('Error removing user: ' + e.message)
  }
}

async function deleteUserRole(pubuser: any, role: any) {
  confirmpubuser.value = pubuser
  confirmrole.value = role
  if (pubuser.id === authStore.id) {
    showConfirm(pubuser.name, 'THIS IS YOU. Do you want to continue?', confirmDeleteUserRole, null, null, null, 'danger')
  } else {
    confirmDeleteUserRole()
  }
}

async function confirmDeleteUserRole() {
  showConfirm(confirmpubuser.value.name + ': ' + confirmrole.value.name, 'Are you sure you want to delete this role?', reallyDeleteUserRole)
}

async function reallyDeleteUserRole() {
  try {
    //console.log('deleteUserRole', pubuser.id, role.id)
    const ok = await api.auth.deleteUserRole(pubid.value, confirmpubuser.value.id, confirmrole.value.id)
    if (!ok) {
      msgBoxFail('User role could not be deleted')
    } else {
      await usersStore.fetchpubusers(pubid.value)
    }
  } catch (e: any) {
    msgBoxError('Error removing user role: ' + e.message)
  }
}

async function startAddUserRole(pubusers: any, pubuser: any) {
  addroleuserid.value = pubuser.id
  addroleusername.value = pubuser.name
  chosennewrole.value = 0
  availablenewroles.value = []
  for (const pubrole of pubusers.pubroles) {
    const hasrole = _.find(pubuser.roles, role => { return role.id === pubrole.id })
    if (!hasrole) {
      const opt = { value: pubrole.id, text: pubrole.name }
      availablenewroles.value.push(opt)
    }
  }
  if (availablenewroles.value.length === 0) {
    return msgBoxOk('No more roles available!')
  }
  showAddRoleModal.value = true
}

function addUserRole() {
  if (chosennewrole.value == 0) return msgBoxOk('No new role chosen!')
  const roletoadd = _.find(pubusers.value.pubroles, role => { return role.id == chosennewrole.value })
  if (!roletoadd) return
  if (roletoadd.isowner) {
    showConfirm(addroleusername.value, 'This is an OWNER role. Do you want to continue?', confirmAddUserRole, null, null, null, 'danger')
  } else {
    confirmAddUserRole()
  }
}

async function confirmAddUserRole() {
  //console.log('addUserRole', addroleuserid.value, chosennewrole.value)
  try {
    const ok = await api.auth.addUserRole(pubid.value, addroleuserid.value, chosennewrole.value)
    if (ok) {
      await usersStore.fetchpubusers(pubid.value)
      nextTick(() => {
        showAddRoleModal.value = false
      })
    } else {
      msgBoxFail('User role could not be added')
    }
  } catch (e: any) {
    msgBoxError('Error adding role: ' + e.message)
  }
}

async function masquerade(pubuser: any) {
  try {
    const ok = await api.auth.masquerade(pubuser.id)
    if (ok) {
      authStore.id = pubuser.id
      authStore.name = pubuser.name
      authStore.super = false
      authStore.masquerading = true
      miscStore.clearAll()
      pubsStore.clearAll()
      submitsStore.clearAll()
      usersStore.clearAll()
      navigateTo('/panel')
    } else {
      msgBoxFail('Could not masquerade')
    }
  } catch (e: any) {
    msgBoxError('Error masquerading: ' + e.message)
  }
}
</script>
