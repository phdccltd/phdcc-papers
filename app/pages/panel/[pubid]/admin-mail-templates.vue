<template>
  <div>
    <!-- ADMIN MAIL TEMPLATES FOR PUBLICATION -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else-if="!(pub.isowner || issuper)">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdminMailTemplates />
      <Messages :error="error" :message="message" />
      <b-container class="bg-yellow p-3">
        <b-row no-gutters>
          <b-col sm="6">
            <b-button variant="outline-success" @click="startAddMailTemplate()" data-cy="admintemplates-add">
              Add mail template
            </b-button>
          </b-col>
          <b-col sm="6">
            <b-button variant="outline-success" @click="toggleShowSubstitutions()">
              Show substitution strings
            </b-button>
            <p v-if="showsubstitutions" v-for="para in substitutions" class="pre-textarea mb-0">{{ para }}</p>
          </b-col>
        </b-row>
      </b-container>
      <b-list-group class="mailtemplates">
        <b-list-group-item v-for="(mailtemplate, index) in mailtemplates" :key="index" class="pubuser">
          <h3 class="publist-submit-h3">
            <b-link @click.prevent="deleteMailTemplate(mailtemplate)" class="me-2">
              <v-icon icon="times-circle" class="btn-outline-danger" />
            </b-link>
            <b-link @click="toggleTemplateShow(mailtemplate)">
              {{ mailtemplate.id }}: {{ mailtemplate.name }}
            </b-link>
            <b-button variant="link" @click="startEditMailTemplate(mailtemplate)">
              <v-icon icon="edit" class="btn-outline-warning" />
            </b-button>
          </h3>
          <b-container v-if="mailtemplate.visible">
            <b-row no-gutters>
              <b-col sm="2">
                Subject
              </b-col>
              <b-col sm="10" class="formfieldview">
                {{ mailtemplate.subject }}
              </b-col>
            </b-row>
            <b-row no-gutters>
              <b-col sm="2">
                Body
              </b-col>
              <b-col sm="10" class="formfieldview">
                <p v-for="para in mailtemplate.bodyParas" class="pre-textarea mb-0">{{ para }}</p>
              </b-col>
            </b-row>
          </b-container>
        </b-list-group-item>
      </b-list-group>
    </div>

    <b-modal v-model="showMailModal" id="bv-modal-mail-template" :title="modaltitle" centered>
      <template #default>
        <form ref="form" @submit.stop.prevent>
          <b-form-group label="Name" label-for="templatename" label-cols-sm="2" :state="true">
            <b-form-input id="templatename" v-model="templatename" placeholder="Required" required></b-form-input>
          </b-form-group>
          <b-form-group label="Subject" label-for="templatesubject" label-cols-sm="2" :state="true">
            <b-form-input id="templatesubject" v-model="templatesubject" placeholder="Required" required></b-form-input>
          </b-form-group>
          <b-form-group label="Body" label-for="templatebody" label-cols-sm="2" :state="true">
            <b-form-textarea id="templatebody" v-model="templatebody" rows="10" max-rows="100" style="overflow-y: auto;" placeholder="Required"
              required>
            </b-form-textarea>
          </b-form-group>
        </form>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="cancelModal"> Cancel </b-button>
        <b-button variant="primary" @click="okMailTemplate"> OK </b-button>
      </template>
    </b-modal>

    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm"  />
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
const modaltitle = ref('UNSET')
const templateid = ref(0)
const templatename = ref('')
const templatesubject = ref('')
const templatebody = ref('')
const showsubstitutions = ref(false)
const showMailModal = ref(false)
const confirmtemplate = ref<any>(null)

onMounted(async () => { // Client only
  error.value = ''
  message.value = ''
  await mailTemplatesStore.clearError()
  await mailTemplatesStore.fetch(pubid.value)
  await submitsStore.fetchpub(pubid.value)
  const flows = submitsStore.flows(pubid.value)
  for (const flow of flows) {
    for (const stage of flow.stages) {
      await submitsStore.fetchformfields(stage.id)
    }
  }
})

const pub = computed(() => {
  const pub = pubsStore.getPub(pubid.value)
  if (!pub) {
    setError('Invalid pubid')
    return false
  }
  miscStore.set({ key: 'page-title', value: pub.name })
  miscStore.set({ key: 'page-title-suffix', value: 'ADMIN MAIL' })
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

const mailtemplates = computed(() => {
  return mailTemplatesStore.get(pubid.value)
})

const substitutions = computed(() => {
  let substitutions = '{{site.name}}\r\n{{site.url}}\r\n{{pub.name}}\r\n{{submit.id}}\r\n{{submit.name}}\r\n{{user.username}}\r\n{{user.id}}\r\n{{now}}\r\n\r\n'
  substitutions += '{{author.username}}\r\n{{author.id}}\r\n\r\n'
  substitutions += '{{grading.score}}\r\n{{grading.comment}}\r\n{{grading.canreview}}\r\n\r\n'
  substitutions += '{{entry.id}}\r\n'
  const flows = submitsStore.flows(pubid.value)
  for (const flow of flows) {
    for (const stage of flow.stages) {
      substitutions += '\r\n' + stage.name + ':\r\n'
      const entry = submitsStore.stagefields(stage.id)
      if (entry) {
        for (const field of entry.fields) {
          substitutions += '{{entry.field_' + field.id + '}} ' + field.label + '\r\n'
        }
      }
    }
  }
  console.log("substitutions", substitutions)
  return substitutions.split('\n')
})

const issuper = computed(() => {
  return authStore.super
})

function cancelModal() {
  showMailModal.value = false
}

function setError(msg: string) {
  error.value = msg
}

function setMessage(msg: string) {
  message.value = msg
}

function toggleShowSubstitutions() {
  showsubstitutions.value = !showsubstitutions.value
}

function toggleTemplateShow(mailtemplate: any) {
  mailtemplate.visible = !mailtemplate.visible
}

function deleteMailTemplate(mailtemplate: any) {
  confirmtemplate.value = mailtemplate
  showConfirm(mailtemplate.name, 'Are you sure you want to delete this template?', confirmDeleteMailTemplate, null, null, null, 'danger')
}

async function confirmDeleteMailTemplate() {
  try {
    const ok = await api.mail.deleteMailTemplate(pubid.value, confirmtemplate.value.id)
    if (ok) {
      await mailTemplatesStore.fetch(pubid.value)
      nextTick(() => {
        showMailModal.value = false
        msgBoxOk('Mail template removed')
      })
    } else {
      msgBoxFail('Remove went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error adding template: ' + e.message)
  }
}

function startAddMailTemplate() {
  modaltitle.value = 'Add mail template'
  templateid.value = 0
  templatename.value = ''
  templatesubject.value = ''
  templatebody.value = ''
  showMailModal.value = true
}

function startEditMailTemplate(mailtemplate: any) {
  modaltitle.value = 'Edit mail template'
  templateid.value = mailtemplate.id
  templatename.value = mailtemplate.name
  templatesubject.value = mailtemplate.subject
  templatebody.value = mailtemplate.body
  showMailModal.value = true
}

async function okMailTemplate() {
  try {
    templatename.value = templatename.value.trim()
    templatesubject.value = templatesubject.value.trim()
    templatebody.value = templatebody.value.trim()
    if (templatename.value.length === 0) return msgBoxOk('Please give a name')
    if (templatesubject.value.length === 0) return msgBoxOk('Please give a subject')
    if (templatebody.value.length === 0) return msgBoxOk('Please give a body')

    const ok = await api.mail.addEditMailTemplate(pubid.value, templateid.value, templatename.value, templatesubject.value, templatebody.value)

    if (ok) {
      await mailTemplatesStore.fetch(pubid.value)
      nextTick(() => {
        showMailModal.value = false
        msgBoxOk('Mail template added/edited')
      })
    } else {
      msgBoxFail('Add/Edit went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error adding template: ' + e.message)
  }
}
</script>
