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
      <HelpAdminMail />
      <Messages :error="error" :message="message" />
      <b-row no-gutters class="bg-yellow p-2">
        <b-col sm="6">
          <div class="mb-2">
            <div>
              <strong>Choose a role:</strong>
              <b-form-select :options="pubusers.pubroles" size="sm" value-field="id" text-field="name" v-model="selectedrole" v-on:input="rolechanged()"
                style="width:auto;">
                <template v-slot:first>
                  <b-form-select-option selected value="0">Select</b-form-select-option>
                  <b-form-select-option selected value="-1">All users</b-form-select-option>
                  <b-form-select-option selected value="-2">Submitters</b-form-select-option>
                </template>
              </b-form-select>
            </div>
          </div>
        </b-col>
        <b-col sm="6">
          <div>
            <strong>Or a user:</strong>
            <b-form-select :options="pubusers.users" size="sm" value-field="id" text-field="name" v-model="selecteduser" v-on:input="userchanged()"
              style="width:auto;">
              <template v-slot:first>
                <b-form-select-option selected value="0">Select</b-form-select-option>
              </template>
            </b-form-select>
          </div>
        </b-col>
      </b-row>
      <b-row no-gutters class="bg-yellow p-2">
        <strong>Load mail template:</strong>
        <b-form-select :options="mailtemplates" size="sm" value-field="id" text-field="name" v-model="selectedtemplate" v-on:input="templatechanged()"
          style="width:auto;">
          <template v-slot:first>
            <b-form-select-option selected value="0">Select</b-form-select-option>
          </template>
        </b-form-select>
      </b-row>
      <b-form ref="form" @submit="onSubmit" @submit.stop.prevent novalidate>
        <b-form-group label="To" label-for="mailsubject" label-cols-sm="2" :state="true">
          <div v-if="selectedrole" class="col-form-label">
            Role {{ rolename }} will email {{ rolecounttext }}.
          </div>
          <div v-if="selecteduser" class="col-form-label">
            ({{ chosenuser.username }},{{ chosenuser.email }})
            has roles: {{ chosenuser.sroles }}
          </div>
        </b-form-group>
        <b-form-group label="Subject" label-for="mailsubject" label-cols-sm="2" :state="true">
          <b-form-input id="mailsubject" v-model="mailsubject" placeholder="Required" required v-on:input="clearmessages()"></b-form-input>
        </b-form-group>
        <b-form-group label="Text" label-for="mailtext" label-cols-sm="2" :state="true">
          Only plain text supported. Substitutions NOT supported.
          <b-form-textarea id="mailtext" v-model="mailtext" v-on:input="clearmessages()" rows="10" max-rows="100" style="overflow-y: auto;"
            placeholder="Required" required>
          </b-form-textarea>
        </b-form-group>
        <b-form-row>
          <b-col cols="10" offset-md="2">
            <b-button variant="success" type="submit" data-cy="adminmail-send">
              Send
            </b-button>
            <Messages :message="sendstatus" :warning="validationsummary" :error="senderror" />
          </b-col>
        </b-form-row>
      </b-form>
    </div>

    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const selectedrole = ref(0)
const selecteduser = ref(0)
const selectedtemplate = ref(0)
const mailsubject = ref('')
const mailtext = ref('')
const sendstatus = ref('')
const validationsummary = ref('')
const senderror = ref('')

onMounted(async () => { // Client only
  error.value = ''
  message.value = ''
  await pubsStore.clearError()
  await pubsStore.fetch()
  await submitsStore.fetchpub(pubid.value)
  await mailTemplatesStore.clearError()
  await mailTemplatesStore.fetch(pubid.value)
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
  miscStore.set({ key: 'page-title-suffix', value: 'ADMIN SEND EMAIL' })
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

const pubusers = computed(() => {
  const pu = usersStore.pubusers(pubid.value)
  return pu ? pu : {}
})

const rolename = computed(() => {
  const iselectedrole = parseInt(selectedrole.value as any)
  if (iselectedrole === -1) {
    return 'All users'
  }
  else if (iselectedrole === -2) {
    return 'Submitters'
  }
  const pubrole = _.find(pubusers.value.pubroles, _pubrole => { return _pubrole.id === iselectedrole })
  return pubrole ? pubrole.name : ''
})

const selectedrolecount = computed(() => {
  let rolecount = 0
  const iselectedrole = parseInt(selectedrole.value as any)
  if (iselectedrole === -1) {
    rolecount = pubusers.value.users?.length || 0
  }
  else if (iselectedrole === -2) {
    for (const user of pubusers.value.users || []) {
      if (user.submits?.length > 0) {
        rolecount++
      }
    }
  } else {
    for (const user of pubusers.value.users || []) {
      if (_.find(user.roles, (role) => { return role.id === iselectedrole })) {
        rolecount++
      }
    }
  }
  return rolecount
})

const rolecounttext = computed(() => {
  const count = selectedrolecount.value
  return count === 1 ? (count + ' user') : (count + ' users')
})

const chosenuser = computed(() => {
  const chosenuser = _.find(pubusers.value.users, (user) => { return user.id === selecteduser.value })
  if (chosenuser) {
    const sroles: string[] = []
    for (const role of chosenuser.roles) {
      sroles.push(role.name)
    }
    chosenuser.sroles = sroles.join(', ')
  }
  return chosenuser
})

const mailtemplates = computed(() => {
  return mailTemplatesStore.get(pubid.value)
})

const issuper = computed(() => {
  return authStore.super
})

function valid1() {
  console.log("valid1")
  return true
}

function setError(msg: string) {
  error.value = msg
}

function setMessage(msg: string) {
  message.value = msg
}

function rolechanged() {
  clearmessages()
  if (selectedrole.value != 0) {
    selecteduser.value = 0
  }
}

function userchanged() {
  clearmessages()
  if (selecteduser.value != 0) {
    selectedrole.value = 0
  }
}

function templatechanged() {
  clearmessages()
  for (const mailtemplate of mailtemplates.value) {
    if (mailtemplate.id == selectedtemplate.value) {
      mailsubject.value = mailtemplate.subject
      mailtext.value = mailtemplate.body
    }
  }
}

function clearmessages() {
  message.value = ''
  error.value = ''
  sendstatus.value = ''
  senderror.value = ''
  validationsummary.value = ''
}

async function onSubmit() {
  try {
    clearmessages()

    mailsubject.value = mailsubject.value.trim()
    if (mailsubject.value.length === 0) {
      validationsummary.value = 'Please give a subject'
      return false
    }
    mailtext.value = mailtext.value.trim()
    if (mailtext.value.length === 0) {
      validationsummary.value = 'Please give the mail text'
      return false
    }

    if (selecteduser.value === 0 && selectedrolecount.value === 0) {
      validationsummary.value = 'No recipients to send to'
      return false
    }
    const recipientcount = selecteduser.value ? 1 : selectedrolecount.value
    sendstatus.value = 'Sending mail. Recipient count: ' + recipientcount

    const ok = await api.mail.sendMail(pubid.value, selecteduser.value, selectedrole.value, mailsubject.value, mailtext.value)
    if (ok) {
      sendstatus.value = 'Sent OK'
      msgBoxOk('Mail sent OK')
    } else {
      senderror.value = 'Error sending mail'
      sendstatus.value = ''
    }
  } catch (e: any) {
    error.value = e.message
    senderror.value = e.message
    sendstatus.value = ''
  }
}
</script>
