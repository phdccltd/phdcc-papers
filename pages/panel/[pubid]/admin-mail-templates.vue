<template>
  <div>
    <!-- ADMIN MAIL TEMPLATES FOR PUBLICATION -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :show="true">
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
            <b-button variant="outline-success" @click="startAddMailTemplate()">
              Add mail template
            </b-button>
          </b-col>
          <b-col sm="6">
            <b-button variant="outline-success" @click="toggleShowSubstitutions()">
              Show substitution strings
            </b-button>
            <b-form-textarea v-if="showsubstitutions" plaintext :value="substitutions" max-rows="100" style="overflow-y: auto;"></b-form-textarea>
          </b-col>
        </b-row>
      </b-container>
      <b-list-group class="mailtemplates">
        <b-list-group-item v-for="(mailtemplate, index) in mailtemplates" :key="index" class="pubuser">
          <h3 class="publist-submit-h3">
            <b-link @click="deleteMailTemplate(mailtemplate)" class="me-2">
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
                <b-form-textarea plaintext :value="mailtemplate.body" max-rows="100" style="overflow-y: auto;"></b-form-textarea>
              </b-col>
            </b-row>
          </b-container>
        </b-list-group-item>
      </b-list-group>
    </div>
    <b-modal id="bv-modal-mail-template" size="xl" centered @ok="okMailTemplate">
      <template v-slot:modal-title>
        {{ modaltitle }}
      </template>
      <form ref="form" @submit.stop.prevent>
        <b-form-group label="Name" label-for="templatename" label-cols-sm="2">
          <b-form-input id="templatename" v-model="templatename" placeholder="Required" required></b-form-input>
        </b-form-group>
        <b-form-group label="Subject" label-for="templatesubject" label-cols-sm="2">
          <b-form-input id="templatesubject" v-model="templatesubject" placeholder="Required" required></b-form-input>
        </b-form-group>
        <b-form-group label="Body" label-for="templatebody" label-cols-sm="2">
          <b-form-textarea id="templatebody" v-model="templatebody" rows="10" max-rows="100" style="overflow-y: auto;" placeholder="Required"
            required>
          </b-form-textarea>
        </b-form-group>
      </form>
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

definePageMeta({
  middleware: 'authuser',
})

export default {
  mixins: [modalBoxes],
  setup() {
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
    //console.log('_id data')
    return {
      error: '',
      message: '',
      modaltitle: 'UNSET',
      templateid: 0,
      templatename: '',
      templatesubject: '',
      templatebody: '',
      showsubstitutions: false,
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
      let substitutions = '{{site.name}}\r{{site.url}}\r{{pub.name}}\r{{submit.id}}\r{{submit.name}}\r{{user.username}}\r{{user.id}}\r{{now}}\r\r'
      substitutions += '{{author.username}}\r{{author.id}}\r\r'
      substitutions += '{{grading.score}}\r{{grading.comment}}\r{{grading.canreview}}\r\r'
      substitutions += '{{entry.id}}\r'
      const flows = this.submitsStore.flows(this.pubid)
      for (const flow of flows) {
        for (const stage of flow.stages) {
          substitutions += '\r' + stage.name + ':\r'
          const entry = this.submitsStore.stagefields(stage.id)
          if (entry) {
            for (const field of entry.fields) {
              substitutions += '{{entry.field_' + field.id + '}} ' + field.label + '\r'
            }
          }
        }
      }
      return substitutions
    },
    issuper() {
      return this.authStore.super
    },
  },
  methods: {
    /* ************************ */
    setError(msg) {
      this.error = msg
    },
    /* ************************ */
    setMessage(msg) {
      this.message = msg
    },
    /* ************************ */
    toggleShowSubstitutions() {
      this.showsubstitutions = !this.showsubstitutions
    },
    /* ************************ */
    toggleTemplateShow(mailtemplate) {
      mailtemplate.visible = !mailtemplate.visible
    },
    /* ************************ */
    async deleteMailTemplate(mailtemplate) {
      try {
        if (!await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this template?', { title: mailtemplate.name })) return
        const ok = await this.$api.mail.deleteMailTemplate(this.pubid, mailtemplate.id)
        if (ok) {
          this.$store.dispatch('mailtemplates/fetch', this.pubid)
          this.$nextTick(() => {
            this.$bvModal.hide('bv-modal-mail-template')
            this.msgBoxOk('Mail template removed')
          })
        } else {
          this.msgBoxOk('Remove went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
        }
      } catch (e) {
        this.msgBoxOk('Error adding template: ' + e.message)
      }
    },
    /* ************************ */
    startAddMailTemplate() {
      this.modaltitle = 'Add mail template'
      this.templateid = 0
      this.templatename = ''
      this.templatesubject = ''
      this.templatebody = ''
      this.$bvModal.show('bv-modal-mail-template')
    },
    /* ************************ */
    startEditMailTemplate(mailtemplate) {
      this.modaltitle = 'Edit mail template'
      this.templateid = mailtemplate.id
      this.templatename = mailtemplate.name
      this.templatesubject = mailtemplate.subject
      this.templatebody = mailtemplate.body
      this.$bvModal.show('bv-modal-mail-template')
    },
    /* ************************ */
    async okMailTemplate(bvModalEvt) {
      //console.log('addMailTemplate', this.templateid, this.templatename, this.templatesubject, this.templatebody)
      bvModalEvt.preventDefault()
      try {
        this.templatename = this.templatename.trim()
        this.templatesubject = this.templatesubject.trim()
        this.templatebody = this.templatebody.trim()
        if (this.templatename.length === 0) return this.msgBoxOk('Please give a name')
        if (this.templatesubject.length === 0) return this.msgBoxOk('Please give a subject')
        if (this.templatebody.length === 0) return this.msgBoxOk('Please give a body')

        const ok = await this.$api.mail.addEditMailTemplate(this.pubid, this.templateid, this.templatename, this.templatesubject, this.templatebody)

        if (ok) {
          this.$store.dispatch('mailtemplates/fetch', this.pubid)
          this.$nextTick(() => {
            this.$bvModal.hide('bv-modal-mail-template')
            this.msgBoxOk('Mail template added/edited')
          })
        } else {
          this.msgBoxOk('Add/Edit went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
        }
      } catch (e) {
        this.msgBoxOk('Error adding template: ' + e.message)
      }
    }
  },
}
</script>
