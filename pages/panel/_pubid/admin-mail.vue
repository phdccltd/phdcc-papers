<template>
  <!-- ADMIN USERS PANEL FOR ONE PUBLICATION -->
  <!-- Access check: correctly fails as API returns error if not allowed -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else-if="!pub.isowner">
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
              <b-form-select :options="pubusers.pubroles"
                             size="sm"
                             value-field="id"
                             text-field="name"
                             v-model="selectedrole"
                             v-on:input="rolechanged()"
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
            <b-form-select :options="pubusers.users"
                           size="sm"
                           value-field="id"
                           text-field="name"
                           v-model="selecteduser"
                           v-on:input="userchanged()"
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
        <b-form-select :options="mailtemplates"
                       size="sm"
                       value-field="id"
                       text-field="name"
                       v-model="selectedtemplate"
                       v-on:input="templatechanged()"
                       style="width:auto;">
          <template v-slot:first>
            <b-form-select-option selected value="0">Select</b-form-select-option>
          </template>
        </b-form-select>
      </b-row>
      <b-form ref="form" @submit="onSubmit" @submit.stop.prevent>
        <b-form-group label="To"
                      label-for="mailsubject"
                      label-cols-sm="2">
          <div v-if="selectedrole" class="col-form-label">
            Role {{rolename}} will email {{rolecounttext}}.
          </div>
          <div v-if="selecteduser" class="col-form-label">
            ({{chosenuser.username}},{{chosenuser.email}})
            has roles: {{chosenuser.sroles}}
          </div>
        </b-form-group>
        <b-form-group label="Subject"
                      label-for="mailsubject"
                      label-cols-sm="2">
          <b-form-input id="mailsubject" v-model="mailsubject" placeholder="Required" required v-on:input="clearmessages()"></b-form-input>
        </b-form-group>
        <b-form-group label="Text"
                      label-for="mailtext"
                      label-cols-sm="2">
          Only plain text supported. Substitutions NOT supported.
          <b-form-textarea id="mailtext"
                           v-model="mailtext"
                           v-on:input="clearmessages()"
                           rows="10"
                           max-rows="100"
                           style="overflow-y: auto;"
                           placeholder="Required"
                           required>
          </b-form-textarea>
        </b-form-group>
        <b-form-row>
          <b-col cols="10" offset-md="2">
            <b-btn variant="success" type="submit">
              Send
            </b-btn>
            <Messages :message="sendstatus" :warning="validationsummary" :error="senderror" />
          </b-col>
        </b-form-row>
      </b-form>
    </div>
  </div>
</template>

<script>
  const _ = require('lodash/core')
  import HelpAdminMail from '~/components/HelpAdminMail'
  import Messages from '~/components/Messages'
  
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { Messages, HelpAdminMail },
    data({ app, params, store }) {
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
      this.$store.dispatch('pubs/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('submits/fetchpub', this.pubid)
      this.$store.dispatch('mailtemplates/clearError')
      this.$store.dispatch('mailtemplates/fetch', this.pubid)
      this.$store.dispatch('users/clearError')
      this.$store.dispatch('users/fetchpubusers', this.pubid)
    },
    computed: {
      pub() {
        const pub = this.$store.getters['pubs/getPub'](this.pubid)
        if (!pub) {
          this.setError('Invalid pubid')
          return false
        }
        page.title = pub.name
        document.title = pub.name
        this.$store.commit("page/setTitle", page.title)
        this.$store.commit("page/setTitleSuffix", 'ADMIN SEND EMAIL')
        return pub
      },
      fatalerror() {
        const error1 = this.$store.getters['users/error']
        return error1
      },
      pubid() {
        //console.log('PUB pubid')
        return parseInt(this.$route.params.pubid)
      },
      pubusers() {
        const pu = this.$store.getters['users/pubusers'](this.pubid)
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
        return pubrole ? pubrole.name: ''
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
        return this.$store.getters['mailtemplates/get'](this.pubid)
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
      rolechanged() {
        this.clearmessages()
        if (this.selectedrole != 0) {
          this.selecteduser = 0
        }
      },
      /* ************************ */
      userchanged() {
        this.clearmessages()
        if (this.selecteduser != 0) {
          this.selectedrole = 0
        }
      },
      /* ************************ */
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
      /* ************************ */
      async onSubmit(evt) {
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

          const ok = await this.$api.mail.sendMail(this.pubid, this.selecteduser, this.selectedrole, this.mailsubject, this.mailtext)
          if (ok) {
            this.sendstatus = 'Sent OK'
            await this.$bvModal.msgBoxOk('Mail sent OK')
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
    /* ************************ */
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
