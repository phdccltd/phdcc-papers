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

    <MessageBoxOK ref="okmsgbox" />
    <ConfirmModal ref="confirm" :title="confirmTitle" :message="confirmMessage" :cancelText="confirmCancelText" :confirmText="confirmOKText"
      :okVariant="okVariant" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMailTemplatesStore } from '~/stores/mailtemplates'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSitePagesStore } from '~/stores/sitepages'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import api from '~/api'
import modalBoxes from '@/mixins/modalBoxes'

export default {
  mixins: [modalBoxes],
  setup() {
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

    return { authStore, mailTemplatesStore, miscStore, pubsStore, sitepagesStore, submitsStore, usersStore }
  },
  data() {
    return {
      error: '',
      message: '',
      modaltitle: 'UNSET',
      templateid: 0,
      templatename: '',
      templatesubject: '',
      templatebody: '',
      showsubstitutions: false,
      showMailModal: false,
      confirmtemplate: null,
    }
  },
  async mounted() { // Client only
    this.error = ''
    this.message = ''
    await this.mailTemplatesStore.clearError()
    await this.mailTemplatesStore.fetch(this.pubid)
    await this.submitsStore.fetchpub(this.pubid)
    const flows = this.submitsStore.flows(this.pubid)
    for (const flow of flows) {
      for (const stage of flow.stages) {
        await this.submitsStore.fetchformfields(stage.id)
      }
    }
  },
  computed: {
    pub() {
      const pub = this.pubsStore.getPub(this.pubid)
      if (!pub) {
        this.setError('Invalid pubid')
        return false
      }
      this.miscStore.set({ key: 'page-title', value: pub.name })
      this.miscStore.set({ key: 'page-title-suffix', value: 'ADMIN MAIL' })
      return pub
    },
    fatalerror() {
      const error1 = this.usersStore.error
      return error1
    },
    pubid() {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    mailtemplates() {
      return this.mailTemplatesStore.get(this.pubid)
    },
    substitutions() {
      let substitutions = '{{site.name}}\r\n{{site.url}}\r\n{{pub.name}}\r\n{{submit.id}}\r\n{{submit.name}}\r\n{{user.username}}\r\n{{user.id}}\r\n{{now}}\r\n\r\n'
      substitutions += '{{author.username}}\r\n{{author.id}}\r\n\r\n'
      substitutions += '{{grading.score}}\r\n{{grading.comment}}\r\n{{grading.canreview}}\r\n\r\n'
      substitutions += '{{entry.id}}\r\n'
      const flows = this.submitsStore.flows(this.pubid)
      for (const flow of flows) {
        for (const stage of flow.stages) {
          substitutions += '\r\n' + stage.name + ':\r\n'
          const entry = this.submitsStore.stagefields(stage.id)
          if (entry) {
            for (const field of entry.fields) {
              substitutions += '{{entry.field_' + field.id + '}} ' + field.label + '\r\n'
            }
          }
        }
      }
      console.log("substitutions", substitutions)
      return substitutions.split('\n')
    },
    issuper() {
      return this.authStore.super
    },
  },
  methods: {
    cancelModal() {
      this.showMailModal = false
    },
    setError(msg) {
      this.error = msg
    },
    setMessage(msg) {
      this.message = msg
    },
    toggleShowSubstitutions() {
      this.showsubstitutions = !this.showsubstitutions
    },
    toggleTemplateShow(mailtemplate) {
      mailtemplate.visible = !mailtemplate.visible
    },
    deleteMailTemplate(mailtemplate) {
      this.confirmtemplate = mailtemplate
      this.showConfirm(mailtemplate.name, 'Are you sure you want to delete this template?', this.confirmDeleteMailTemplate, null, null, null, 'danger')
    },
    async confirmDeleteMailTemplate() {
      try {
        const ok = await api.mail.deleteMailTemplate(this.pubid, this.confirmtemplate.id)
        if (ok) {
          await this.mailTemplatesStore.fetch(this.pubid)
          this.$nextTick(() => {
            this.showMailModal = false
            this.msgBoxOk('Mail template removed')
          })
        } else {
          this.msgBoxFail('Remove went wrong')
        }
      } catch (e) {
        this.msgBoxError('Error adding template: ' + e.message)
      }
    },
    startAddMailTemplate() {
      this.modaltitle = 'Add mail template'
      this.templateid = 0
      this.templatename = ''
      this.templatesubject = ''
      this.templatebody = ''
      this.showMailModal = true
    },
    startEditMailTemplate(mailtemplate) {
      this.modaltitle = 'Edit mail template'
      this.templateid = mailtemplate.id
      this.templatename = mailtemplate.name
      this.templatesubject = mailtemplate.subject
      this.templatebody = mailtemplate.body
      this.showMailModal = true
    },
    async okMailTemplate() {
      //console.log('addMailTemplate', this.templateid, this.templatename, this.templatesubject, this.templatebody)
      try {
        this.templatename = this.templatename.trim()
        this.templatesubject = this.templatesubject.trim()
        this.templatebody = this.templatebody.trim()
        if (this.templatename.length === 0) return this.msgBoxOk('Please give a name')
        if (this.templatesubject.length === 0) return this.msgBoxOk('Please give a subject')
        if (this.templatebody.length === 0) return this.msgBoxOk('Please give a body')

        const ok = await api.mail.addEditMailTemplate(this.pubid, this.templateid, this.templatename, this.templatesubject, this.templatebody)

        if (ok) {
          await this.mailTemplatesStore.fetch(this.pubid)
          this.$nextTick(() => {
            this.showMailModal = false
            this.msgBoxOk('Mail template added/edited')
          })
        } else {
          this.msgBoxFail('Add/Edit went wrong')
        }
      } catch (e) {
        this.msgBoxError('Error adding template: ' + e.message)
      }
    }
  },
}
</script>
