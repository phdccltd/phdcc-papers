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
              <b-btn variant="link" class="float-right" @click="startAddUserRole(pubusers, pubuser)">
                <v-icon name="plus-circle" scale="1.5" class="btn-outline-warning" />
              </b-btn>
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

      <b-modal id="bv-modal-add-role" centered @ok="addUserRole">
        <template v-slot:modal-title>
          Add role
        </template>
        <form ref="form" @submit.stop.prevent>
          <b-form-group label="user"
                        label-for="addroleusername"
                        label-cols-sm="4">
            <b-form-input id="addroleusername" disabled v-model="addroleusername"></b-form-input>
          </b-form-group>
          <b-form-group label="Role"
                        label-for="new-role"
                         label-cols-sm="4">
            <b-form-select :options="this.availablenewroles"
                           size="sm"
                           v-model="newrole"
                           style="width:auto;">
              <template v-slot:first>
                <b-form-select-option disabled value="0">Select a role</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
        </form>
      </b-modal>
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
        addroleuserid: 0,
        addroleusername: '',
        newrole: 0,
        availablenewroles: [],
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
      hasRole(pubuser) {
        const selectedrole = parseInt(this.selectedrole)
        if (selectedrole === 0) return true
        const hasrole = _.find(pubuser.roles, role => { return role.id === selectedrole })
        return hasrole
      },
      async deleteUserRole(pubuser, role) {
        //console.log('deleteUserRole', pubuser.id, role.id)
        const ok = await this.$api.user.deleteUserRole(this.pubid, pubuser.id, role.id)
        if (!ok) {
          this.$bvToast.toast('User role could not be deleted', {
            title: 'Delete ' + role.name + ' for '+pubuser.name,
            toaster: 'b-toaster-top-center',
            variant: 'danger',
          })
        } else {
          this.$store.dispatch('users/fetchpubusers', this.pubid)
        }
      },
      async startAddUserRole(pubusers, pubuser) {
        this.addroleuserid = pubuser.id
        this.addroleusername = pubuser.name
        this.newrole = 0
        this.availablenewroles = []
        for (const pubrole of pubusers.pubroles) {
          const hasrole = _.find(pubuser.roles, role => { return role.id === pubrole.id })
          if (!hasrole) {
            const opt = { value: pubrole.id, text: pubrole.name }
            this.availablenewroles.push(opt)
          }
        }
        if (this.availablenewroles.length === 0) {
          await this.$bvModal.msgBoxOk('No more roles available!', { title: 'Add role' })
          return
        }
        this.$bvModal.show('bv-modal-add-role')
      },
      async addUserRole(bvModalEvt) {
        console.log('addUserRole', this.addroleuserid, this.newrole)
        bvModalEvt.preventDefault()
        try {
          if (this.newrole == 0) return await this.$bvModal.msgBoxOk('No new role chosen!')
          this.$nextTick(() => {
            this.$bvModal.hide('bv-modal-add-role')
          })
        } catch (e) {
          this.$bvModal.msgBoxOk('Error changing title: ' + e.message)
        }
      },
    },
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
