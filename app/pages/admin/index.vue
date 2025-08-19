<template>
  <div>
    <!-- SUPER-ADMIN PAGE -->
    <HelpSuper />
    <Messages :error="error" :message="message" />

    <b-list-group>
      <b-list-group-item class="flow">
        <h2 class="bg-yellow ps-2 pt-2">
          General
        </h2>
        <div class="mt-2 mb-2">
          <b-button variant="outline-success" to="/admin/site-pages" class="ms-2">Site pages</b-button>
        </div>
      </b-list-group-item>
    </b-list-group>

    <b-list-group>
      <b-list-group-item class="flow">
        <h2 class="bg-yellow ps-2 pt-2">
          Publications
          <b-button @click="addpub()" variant="outline-success" class="me-2 float-end">Add publication</b-button>
        </h2>
        <b-container class="p-0">
          <div v-for="(pub, index) in pubs" :key="index">
            <b-row style="border-top:1px solid rgba(0, 0, 0, 0.125);" no-gutters
              :class="'p-2 ' + (pub.owner ? 'pub-owner' : (pub.notowner ? 'pub-notowner' : (issuper ? 'pub-super' : 'pub-weird')))">
              <b-col sm="1">
                <b-button variant="link" @click="togglePubEdit(pub)">
                  <v-icon v-if="pub.superedit" icon="minus-square" size="2x" class="btn-outline-warning" />
                  <v-icon v-if="!pub.superedit" icon="plus-square" size="2x" class="btn-outline-warning" />
                </b-button>
              </b-col>
              <b-col sm="3">
                <b-button variant="outline-primary" :to="'/panel/' + pub.id">
                  {{ pub.name }}
                </b-button>
              </b-col>
              <b-col sm="6">
                {{ pub.description }}
              </b-col>
              <b-col sm="2">
                <b-badge v-if="!pub.enabled" pill variant="danger">DISABLED</b-badge>
              </b-col>
            </b-row>
            <div v-if="pub.superedit">
              <b-row style="border-bottom:1px solid rgba(0, 0, 0, 0.125);" no-gutters class="p-2">
                <b-col sm="4">
                  <b-button variant="outline-warning" @click="togglePubEnable(pub)">
                    {{ pub.enabled ? 'DISABLE' : 'ENABLE' }}
                  </b-button>
                </b-col>
                <b-col sm="4">
                  <b-button variant="outline-danger" @click="duplicatePub(pub)">
                    Duplicate
                  </b-button>
                </b-col>
                <b-col sm="4">
                  <b-button variant="outline-danger" @click="deletePub(pub)" class="text-right">
                    DELETE
                  </b-button>
                </b-col>
              </b-row>

              <b-row style="border-bottom:1px solid rgba(0, 0, 0, 0.125);" no-gutters class="p-2">
                <b-col sm="6">
                  <b-list-group>
                    <b-list-group-item v-for="(superpubrole, index) in pub.superpubroles" :key="index">
                      {{ superpubrole.name }} &times; {{ superpubrole.users.length }}
                      <ul v-if="superpubrole.isowner" class="mb-0">
                        <li v-for="(user, index2) in superpubrole.users" :key="index2">
                          {{ user.username }} - {{ user.email }}
                        </li>
                      </ul>
                    </b-list-group-item>
                  </b-list-group>
                </b-col>
                <b-col sm="6">
                  <div v-if="pub.hasanyrole">
                    <b-form @submit.stop.prevent class="ms-5">
                      <b-form-group label="User:" label-cols-sm="2" :state="true">
                        <b-form-select v-model="pub.adduserid" :options="allusersoptions" class="me-2"></b-form-select>
                      </b-form-group>
                      <b-form-group label="Role:" label-cols-sm="2" :state="true">
                        <b-form-select v-model="pub.addroleid" :options="allrolesoptions(pub.id)" class="me-2"></b-form-select>
                      </b-form-group>
                      <b-form-group label="" label-cols-sm="3" :state="true">
                        <b-button variant="outline-success" @click="addPubRole(pub)">
                          Add role
                        </b-button>
                      </b-form-group>
                    </b-form>
                  </div>
                  <div v-else>
                    No owner role:
                    <b-button variant="outline-success" @click="addPubRoleOwner(pub)">
                      Add owner role
                    </b-button>
                  </div>
                </b-col>
              </b-row>
            </div>
          </div>
        </b-container>
      </b-list-group-item>
    </b-list-group>


    <b-modal v-model="showAddModal" id="bv-modal-add-pub" title="Add publication" centered>
      <template #default>
        <form ref="form" @submit.stop.prevent>
          <b-form-group label="Name" label-for="pubname" label-cols-sm="2" :state="true">
            <b-form-input id="pubname" v-model="pubname" placeholder="Required" required></b-form-input>
          </b-form-group>
          <b-form-group label="Description" label-for="pubdescr" label-cols-sm="2" :state="true">
            <b-form-textarea id="pubdescr" v-model="pubdescr" rows="3" max-rows="10" style="overflow-y: auto;" placeholder="Required" required>
            </b-form-textarea>
          </b-form-group>
        </form>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="cancelModal"> Cancel </b-button>
        <b-button variant="primary" @click="okAddPub"> OK </b-button>
      </template>
    </b-modal>

    <b-modal v-model="showDuplicateModal" id="bv-modal-dup-pub" title="Duplicate publication" centered>
      <template #default>
        <form ref="form" @submit.stop.prevent>
          <ul>
            <li>
              This function will duplicate a publication, ie copy the set up but not copy the submissions.
            </li>
            <li>
              You can choose whether or not to give the current publication users access to the new publication - and copy their roles across.
            </li>
          </ul>
          <b-form-group label="Name" label-for="pubname" label-cols-sm="2" :state="true">
            <b-form-input id="pubname" v-model="pubname" placeholder="Required" required></b-form-input>
          </b-form-group>
          <b-form-group label="Users" label-for="pubdupusers" label-cols-sm="2" :state="true">
            <b-form-checkbox id="pubdupusers" v-model="pubdupusers" class="mt-2">
              Give users access and copy roles
            </b-form-checkbox>
          </b-form-group>
        </form>
        <div class="text-center bg-warning m-2" v-if="showdupwait">Please wait...</div>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="cancelModal"> Cancel </b-button>
        <b-button variant="primary" @click="okDupPub"> OK </b-button>
      </template>
    </b-modal>
    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

definePageMeta({
  middleware: 'authsuper',
})

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const usersStore = useUsersStore()

const error = ref('')
const message = ref('')
const pubname = ref('')
const pubdescr = ref('')
const pubdupusers = ref(true)
const pubduppubid = ref(0)
const showdupwait = ref(false)
const confirmpub = ref(null)
const showAddModal = ref(false)
const showDuplicateModal = ref(false)

onMounted(async () => {
  error.value = ''
  message.value = ''
  await pubsStore.clearError()
  await pubsStore.fetch()
  await usersStore.clearError()
  await usersStore.fetchallusers()
  miscStore.set({ key: 'page-title', value: 'Site super admin' })
})

const pubs = computed(() => {
  return pubsStore.pubs
})

const allusersoptions = computed(() => {
  const allusers = usersStore.getall()
  const allusersoptions = []
  for (const user of allusers) {
    allusersoptions.push({ value: user.id, text: user.username + ' - ' + user.email })
  }
  return allusersoptions
})

const allrolesoptions = computed(() => {
  return (pubid: number) => {
    const pubs = pubsStore.pubs
    const allrolesoptions = []
    for (const pub of Object.values(pubs)) {
      if (pub.id === pubid) {
        for (const pubrole of pub.pubroles) {
          allrolesoptions.push({ value: pubrole.id, text: pubrole.name })
        }
        break
      }
    }
    return allrolesoptions
  }
})

const issuper = computed(() => {
  return authStore.super
})

const isowner = computed(() => {
  return authStore.super
})

function addpub() {
  pubname.value = ''
  pubdescr.value = ''
  showAddModal.value = true
}

async function okAddPub() {
  //console.log('okAddPub', pubname.value, pubdescr.value)
  try {
    pubname.value = pubname.value.trim()
    pubdescr.value = pubdescr.value.trim()
    if (pubname.value.length === 0) return msgBoxOk('Please give a publication name')
    if (pubdescr.value.length === 0) return msgBoxOk('Please give a publication description')

    const ok = await api.pubs.addPub(pubname.value, pubdescr.value)

    if (ok) {
      await pubsStore.fetch()
      nextTick(() => {
        showAddModal.value = false
        msgBoxOk('Publication added')
      })
    } else {
      msgBoxFail('Add went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error adding publication: ' + e.message)
  }
}

function togglePubEdit(pub: any) {
  pub.superedit = !pub.superedit
}

function cancelModal() {
  showAddModal.value = false
  showDuplicateModal.value = false
}

function togglePubEnable(pub: any) {
  console.log('togglePubEnable')
  confirmpub.value = pub
  showConfirm(pub.name, 'Are you sure you want to ' + (pub.enabled ? 'disable' : 'enable') + ' this publication?', confirmTogglePubEnable)
}

async function confirmTogglePubEnable() {
  try {
    const ok = await api.pubs.toggleEnablePub(confirmpub.value.id, !confirmpub.value.enabled)
    if (ok) {
      confirmpub.value.enabled = !confirmpub.value.enabled
      await pubsStore.fetch()
    } else {
      msgBoxFail('Toggling enable went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error toggling enable on publication: ' + e.message)
  }
}

function deletePub(pub: any) {
  console.log('deletePub')
  confirmpub.value = pub
  showConfirm(pub.name, 'Are you sure you want to delete this publication?', confirmDeletePub, 'YES', 'NO', null, 'danger') // TODO CHECK THAT ALL TRACES REMOVED okVariant: 'danger'
}

async function confirmDeletePub() {
  try {
    const ok = await api.pubs.deletePub(confirmpub.value.id)
    if (ok) {
      await pubsStore.fetch()
      nextTick(() => {
        msgBoxOk('Publication deleted')
      })
    } else {
      msgBoxFail('Delete went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error deleting publication: ' + e.message)
  }
}

async function addPubRoleOwner(pub: any) {
  try {
    const ok = await api.pubs.addPubRoleOwner(pub.id)
    if (ok) {
      await pubsStore.fetch()
    } else {
      msgBoxFail('Add owner role went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error adding owner role: ' + e.message)
  }
}

async function addPubRole(pub: any) {
  try {
    if (pub.adduserid === 0) return msgBoxOk('Please select a user to add')
    if (pub.addroleid === 0) return msgBoxOk('Please select a role to add')
    const ok = await api.pubs.addPubRole(pub.id, pub.adduserid, pub.addroleid)
    if (ok) {
      await pubsStore.fetch()
    } else {
      msgBoxFail('Add owner went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error adding owner: ' + e.message)
  }
}

function duplicatePub(pub: any) {
  pubname.value = pub.name + ' COPY'
  pubdupusers.value = true
  pubduppubid.value = pub.id
  showdupwait.value = false
  showDuplicateModal.value = true
}

async function okDupPub() {
  try {
    pubname.value = pubname.value.trim()
    if (pubname.value.length === 0) return msgBoxOk('Please give a publication name')

    showdupwait.value = true
    const ok = await api.pubs.duplicatePub(pubduppubid.value, pubname.value, pubdupusers.value)

    if (ok) {
      await pubsStore.fetch()
      nextTick(() => {
        showDuplicateModal.value = false
        msgBoxOk('Publication duplicated')
      })
    } else {
      showdupwait.value = false
      msgBoxFail('Duplicate went wrong')
    }
  } catch (e: any) {
    showdupwait.value = false
    msgBoxError('Error duplicating publication: ' + e.message)
  }
}
</script>

