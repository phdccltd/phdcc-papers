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
import _ from 'lodash/core'
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
      selectedrole: 0,
      selecteduser: 0,
      selectedtemplate: 0,
      mailsubject: '',
      mailtext: '',
      sendstatus: '',
      validationsummary: '',
      senderror: '',
    }
  },
  async mounted() { // Client only
    this.error = ''
    this.message = ''
    await this.pubsStore.clearError()
    await this.pubsStore.fetch()
    await this.submitsStore.fetchpub(this.pubid)
    await this.mailTemplatesStore.clearError()
    await this.mailTemplatesStore.fetch(this.pubid)
    await this.usersStore.clearError()
    await this.usersStore.fetchpubusers(this.pubid)
  },
  computed: {
    pub() {
      const pub = this.pubsStore.getPub(this.pubid)
      if (!pub) {
        this.setError('Invalid pubid')
        return false
      }
      this.miscStore.set({ key: 'page-title', value: pub.name })
      this.miscStore.set({ key: 'page-title-suffix', value: 'ADMIN SEND EMAIL' })
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
    pubusers() {
      const pu = this.usersStore.pubusers(this.pubid)
      return pu ? pu : {}
    },
    rolename() {
      const iselectedrole = parseInt(this.selectedrole)
      if (iselectedrole === -1) {
        return 'All users'
      }
      else if (iselectedrole === -2) {
        return 'Submitters'
      }
      const pubrole = _.find(this.pubusers.pubroles, _pubrole => { return _pubrole.id === iselectedrole })
      return pubrole ? pubrole.name : ''
    },
    selectedrolecount() {
      let rolecount = 0
      const iselectedrole = parseInt(this.selectedrole)
      if (iselectedrole === -1) {
        rolecount = this.pubusers.users.length
      }
      else if (iselectedrole === -2) {
        for (const user of this.pubusers.users) {
          if (user.submits.length > 0) {
            rolecount++
          }
        }
      } else {
        for (const user of this.pubusers.users) {
          if (_.find(user.roles, (role) => { return role.id === iselectedrole })) {
            rolecount++
          }
        }
      }
      return rolecount
    },
    rolecounttext() {
      const selectedrolecount = this.selectedrolecount
      return selectedrolecount === 1 ? (selectedrolecount + ' user') : (selectedrolecount + ' users')
    },
    chosenuser() {
      const chosenuser = _.find(this.pubusers.users, (user) => { return user.id === this.selecteduser })
      if (chosenuser) {
        chosenuser.sroles = []
        for (const role of chosenuser.roles) {
          chosenuser.sroles.push(role.name)
        }
        chosenuser.sroles = chosenuser.sroles.join(', ')
      }
      return chosenuser
    },
    mailtemplates() {
      return this.mailTemplatesStore.get(this.pubid)
    },
    issuper() {
      return this.authStore.super
    },
  },
  methods: {
    valid1() {
      console.log("valid1")
      return true
    },
    setError(msg) {
      this.error = msg
    },
    setMessage(msg) {
      this.message = msg
    },
    rolechanged() {
      this.clearmessages()
      if (this.selectedrole != 0) {
        this.selecteduser = 0
      }
    },
    userchanged() {
      this.clearmessages()
      if (this.selecteduser != 0) {
        this.selectedrole = 0
      }
    },
    templatechanged() {
      this.clearmessages()
      for (const mailtemplate of this.mailtemplates) {
        if (mailtemplate.id == this.selectedtemplate) {
          this.mailsubject = mailtemplate.subject
          this.mailtext = mailtemplate.body
        }
      }
    },
    clearmessages() {
      this.message = ''
      this.error = ''
      this.sendstatus = ''
      this.senderror = ''
      this.validationsummary = ''
    },
    async onSubmit() {
      try {
        this.clearmessages()

        this.mailsubject = this.mailsubject.trim()
        if (this.mailsubject.length === 0) {
          this.validationsummary = 'Please give a subject'
          return false
        }
        this.mailtext = this.mailtext.trim()
        if (this.mailtext.length === 0) {
          this.validationsummary = 'Please give the mail text'
          return false
        }

        if (this.selecteduser === 0 && this.selectedrolecount === 0) {
          this.validationsummary = 'No recipients to send to'
          return false
        }
        const recipientcount = this.selecteduser ? 1 : this.selectedrolecount
        this.sendstatus = 'Sending mail. Recipient count: ' + recipientcount

        const ok = await api.mail.sendMail(this.pubid, this.selecteduser, this.selectedrole, this.mailsubject, this.mailtext)
        if (ok) {
          this.sendstatus = 'Sent OK'
          this.msgBoxOk('Mail sent OK')
        } else {
          this.senderror = 'Error sending mail'
          this.sendstatus = ''
        }
      } catch (e) {
        this.error = e.message
        this.senderror = e.message
        this.sendstatus = ''
      }

    },
  },
}
</script>
