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
      <b-row no-gutters class="bg-yellow p-3">
        <b-col sm="6">
          <div class="mb-2">
            <div>
              <strong>Choose a role:</strong>
              <b-form-select :options="pubusers.pubroles"
                             size="sm"
                             value-field="id"
                             text-field="name"
                             v-model="selectedrole"
                             style="width:auto;">
                <template v-slot:first>
                  <b-form-select-option selected value="0">Select</b-form-select-option>
                  <b-form-select-option selected value="-1">All users</b-form-select-option>
                </template>
              </b-form-select>
            </div>
            <div v-if="selectedrole">
              This selection will email {{rolecount}}.
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
                           style="width:auto;">
              <template v-slot:first>
                <b-form-select-option selected value="0">Select</b-form-select-option>
              </template>
            </b-form-select>
          </div>
          <div v-if="selecteduser">
            ({{chosenuser.username}},{{chosenuser.email}})
            has roles: {{chosenuser.sroles}}
          </div>
        </b-col>
      </b-row>
      <b-row no-gutters class="bg-yellow p-3">
        <strong>Load mail template:</strong>
        <b-form-select :options="mailtemplates"
                       size="sm"
                       value-field="id"
                       text-field="name"
                       v-model="selectedtemplate"
                       style="width:auto;">
          <template v-slot:first>
            <b-form-select-option selected value="0">Select</b-form-select-option>
          </template>
        </b-form-select>
      </b-row>
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
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      this.$store.dispatch('pubs/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('submits/fetchpub', this.pubid)
      const flows = this.$store.getters['submits/flows'](this.pubid)
      if (flows) {
        this.$store.dispatch('mailtemplates/clearError')
        for (const flow of flows) {
          this.$store.dispatch('mailtemplates/fetch', flow.id)
        }
      }
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
      rolecount() {
        let rolecount = 0
        if (parseInt(this.selectedrole) === -1) {
          rolecount = this.pubusers.users.length
        } else {
          for (const user of this.pubusers.users) {
            if (_.find(user.roles, (role) => { return role.id === this.selectedrole })) {
              rolecount++
            }
          }
        }
        return rolecount === 1 ? (rolecount + ' user') : (rolecount + ' users')
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
        const mailtemplates =[]
        const flows = this.$store.getters['submits/flows'](this.pubid)
        if (flows) {
          for (const flow of flows) {
            const templates = this.$store.getters['mailtemplates/get'](flow.id)
            for (const template of templates) {
              mailtemplates.push(template)
            }
          }
        }
        return mailtemplates
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
      hasRole(pubuser) {
        const selectedrole = parseInt(this.selectedrole)
        if (selectedrole === 0) return true
        const hasrole = _.find(pubuser.roles, role => { return role.id === selectedrole })
        return hasrole
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
