<template>
  <!-- ADMIN PANEL FOR ONE PUBLICATION -->
  <!-- Access check: correctly fails as API returns error if not allowed -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else-if="!pub.isowner">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdmin />
      <Messages :error="error" :message="message" />
      <form ref="form" @submit.stop.prevent>
        Filter:
        <b-form-select :options="pubusers.pubroles"
                       size="sm"
                       value-field="id"
                       text-field="name"
                       v-model="selectedrole"
                       style="width:auto;">
          <template v-slot:first>
            <b-form-select-option selected value="0">All roles</b-form-select-option>
          </template>
        </b-form-select>
      </form>

      <b-list-group class="pubusers">
        <b-list-group-item v-for="(pubuser, index) in pubusers.users" :key="index" class="pubuser" v-if="hasRole(pubuser)">
          <b-row no-gutters>
            <b-col sm="6">
              <strong>{{pubuser.id}} {{pubuser.name}}</strong>
            </b-col>
            <b-col sm="6">
              <div v-for="(role, index) in pubuser.roles" :key="index" class="pubuserrole">
                <b-link @click="deleteUserRole(pubuser,role)">
                  <v-icon name="times-circle" scale="1" class="btn-outline-danger" />
                </b-link>
                {{role.name}} {{role.id}}
              </div>
            </b-col>
          </b-row>
        </b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>

<script>
  const _ = require('lodash/core')
  import HelpAdmin from '~/components/HelpAdmin'
  import Messages from '~/components/Messages'
  
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { Messages, HelpAdmin },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: '',
        selectedrole: 0,
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      this.$store.dispatch('users/clearError')
      this.$store.dispatch('users/fetchpubusers', this.pubid)
    },
    computed: {
      pub() {
        const pub = this.$store.getters['pubs/getPub'](this.pubid)
        if (!pub) {
          setError('Invalid pubid')
          return false
        }
        page.title = pub.name
        document.title = pub.name
        this.$store.commit("page/setTitle", page.title)
        this.$store.commit("page/setTitleSuffix", 'ADMIN')
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
        return this.$store.getters['users/pubusers'](this.pubid)
      },
    },
    methods: {
      setError(msg) {
        this.error = msg
      },
      setMessage(msg) {
        this.message = msg
      },
      async deleteUserRole(pubuser, role) {
        this.message = ''
        console.log('deleteUserRole', pubuser.id, role.id)
        //const ok = await this.$api.user.deleteUserRole(this.pubid, pubuser.id, role.id)
        const ok = false
        console.log('ok', ok)
        if (!ok) {
          this.$bvToast.toast('User role could not be deleted', {
            //title: `Toaster`
          })
        } else {
          this.$store.dispatch('users/fetchpubusers', this.pubid)
        }
      },
      hasRole(pubuser) {
        const selectedrole = parseInt(this.selectedrole)
        if (selectedrole === 0) return true
        const hasrole = _.find(pubuser.roles, role => { return role.id === selectedrole })
        return hasrole
      },
    },
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
