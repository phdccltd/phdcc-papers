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
      <HelpAdminUsers />
      <Messages :error="error" :message="message" />
      <b-row no-gutters class="bg-yellow p-3">
        <b-col sm="6">
          <form ref="form" @submit.stop.prevent>
            Filter:
            <b-form-select :options="pubusers.pubroles" size="sm" value-field="id" text-field="name" v-model="selectedrole" style="width:auto;">
              <template v-slot:first>
                <b-form-select-option selected value="0">All roles</b-form-select-option>
              </template>
            </b-form-select>
          </form>
        </b-col>
        <b-col sm="6">
        </b-col>
      </b-row>
      <b-list-group class="pubusers" data-cy="adminusers-pubusers">
        <div v-for="(pubuser, index) in pubusers.users" :key="index">
          <b-list-group-item class="pubuser" v-if="hasRole(pubuser)">
            <b-row no-gutters>
              <b-col sm="6">
                <b-link @click.prevent="deletePubUser(pubuser)" class="me-2">
                  <v-icon icon="times-circle" class="btn-outline-danger" />
                </b-link>
                <strong>{{ pubuser.id }} {{ pubuser.name }}</strong>
                {{ pubuser.email }}
                <br />
                Submissions: {{ pubuser.submitcount }}
                <b-button v-if="canmasquerade(pubuser)" @click="masquerade(pubuser)" variant="outline-warning" size="sm">Masquerade</b-button>
              </b-col>
              <b-col sm="6">
                <b-button variant="link" class="float-end" @click="startAddUserRole(pubusers, pubuser)">
                  <v-icon icon="plus-circle" class="btn-outline-warning" />
                </b-button>
                <div v-for="(role, index) in pubuser.roles" :key="index" class="pubuserrole">
                  <b-link @click.prevent="deleteUserRole(pubuser, role)">
                    <v-icon icon="times-circle" class="btn-outline-danger" />
                  </b-link>
                  {{ role.name }}
                </div>
              </b-col>
            </b-row>
          </b-list-group-item>
        </div>
      </b-list-group>

    </div>

    <b-modal v-model="showAddRoleModal" id="bv-modal-add-role" title="Add role" centered>
      <template #default>
        <p>Note: adding some roles may send emails, eg Author.</p>
        <form ref="form" @submit.stop.prevent>
          <b-form-group label="user" label-for="addroleusername" label-cols-sm="4" :state="true">
            <b-form-input id="addroleusername" disabled v-model="addroleusername"></b-form-input>
          </b-form-group>
          <b-form-group label="Role" label-for="new-role" label-cols-sm="4" :state="true">
            <b-form-select :options="this.availablenewroles" size="sm" v-model="chosennewrole" style="width:auto;">
              <template v-slot:first>
                <b-form-select-option disabled value="0">Select a role</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
        </form>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="cancelModal"> Cancel </b-button>
        <b-button variant="primary" @click="addUserRole"> OK </b-button>
      </template>
    </b-modal>

    <MessageBoxOK ref="okmsgbox" />
    <ConfirmModal ref="confirm" :title="confirmTitle" :message="confirmMessage" :cancelText="confirmCancelText" :confirmText="confirmOKText"
      :okVariant="okVariant" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import _ from 'lodash/core'
import api from '~/api'
import modalBoxes from '@/mixins/modalBoxes'

export default {
  inject: { setLayoutMessage: {} },
  mixins: [modalBoxes],
  setup() {
    definePageMeta({
      middleware: 'authuser',
    })
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()
    const usersStore = useUsersStore()

    return { authStore, miscStore, pubsStore, submitsStore, usersStore }
  },
  data() {
    //console.log('_id data')
    return {
      error: '',
      message: '',
      selectedrole: 0,
      addroleuserid: 0,
      addroleusername: '',
      chosennewrole: 0,
      availablenewroles: [],
      showAddRoleModal: false,
      confirmpubuser: null,
      confirmrole: null,
    }
  },
  async mounted() { // Client only
    this.setLayoutMessage()
    this.error = ''
    this.message = ''
    await this.pubsStore.clearError()
    await this.pubsStore.fetch()
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
      this.miscStore.set({ key: 'page-title-suffix', value: 'ADMIN USERS' })
      return pub
    },
    fatalerror() {
      return this.usersStore.error
    },
    pubid() {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    pubusers() {
      const pu = this.usersStore.pubusers(this.pubid)
      return pu ? pu : {}
    },
    issuper() {
      return this.authStore.super
    },
  },
  methods: {
    canmasquerade(pubuser) {
      return this.authStore.super && (this.authStore.id != pubuser.id)
    },
    cancelModal() {
      this.showAddRoleModal = false
    },
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
    deletePubUser(pubuser) {
      this.confirmpubuser = pubuser
      if (pubuser.id === this.authStore.id) {
        this.showConfirm(pubuser.name, 'THIS IS YOU. Do you want to continue?', this.confirmDeletePubUser, null, null, null, 'danger')
      } else {
        this.confirmDeletePubUser()
      }
    },
    confirmDeletePubUser() {
      this.showConfirm(this.confirmpubuser.name, 'Are you sure you want to stop this user accessing your publication/conference?  No submissions etc will be removed.', this.reallyDeletePubUser)
    },
    async reallyDeletePubUser() {
      try {
        //console.log('deletePubUser', pubuser.id, this.authStore.id)
        const ok = await api.auth.removePubUser(this.pubid, this.confirmpubuser.id)
        if (ok) {
          await this.usersStore.fetchpubusers(this.pubid)
        } else {
          this.msgBoxFail('User could not be removed')
        }
      } catch (e) {
        this.msgBoxError('Error removing user: ' + e.message)
      }
    },
    async deleteUserRole(pubuser, role) {
      this.confirmpubuser = pubuser
      this.confirmrole = role
      if (pubuser.id === this.authStore.id) {
        this.showConfirm(pubuser.name, 'THIS IS YOU. Do you want to continue?', this.confirmDeleteUserRole, null, null, null, 'danger')
      } else {
        this.confirmDeleteUserRole()
      }
    },
    async confirmDeleteUserRole() {
      this.showConfirm(this.confirmpubuser.name + ': ' + this.confirmrole.name, 'Are you sure you want to delete this role?', this.reallyDeleteUserRole)
    },
    async reallyDeleteUserRole() {
      try {
        //console.log('deleteUserRole', pubuser.id, role.id)
        const ok = await api.auth.deleteUserRole(this.pubid, this.confirmpubuser.id, this.confirmrole.id)
        if (!ok) {
          this.msgBoxFail('User role could not be deleted')
        } else {
          await this.usersStore.fetchpubusers(this.pubid)
        }
      } catch (e) {
        this.msgBoxError('Error removing user role: ' + e.message)
      }
    },
    async startAddUserRole(pubusers, pubuser) {
      this.addroleuserid = pubuser.id
      this.addroleusername = pubuser.name
      this.chosennewrole = 0
      this.availablenewroles = []
      for (const pubrole of pubusers.pubroles) {
        const hasrole = _.find(pubuser.roles, role => { return role.id === pubrole.id })
        if (!hasrole) {
          const opt = { value: pubrole.id, text: pubrole.name }
          this.availablenewroles.push(opt)
        }
      }
      if (this.availablenewroles.length === 0) {
        return this.msgBoxOk('Add role', 'No more roles available!')
      }
      this.showAddRoleModal = true
    },
    addUserRole() {
      if (this.chosennewrole == 0) return this.msgBoxOk('No new role chosen!')
      const roletoadd = _.find(this.pubusers.pubroles, role => { return role.id == this.chosennewrole })
      if (!roletoadd) return
      if (roletoadd.isowner) {
        this.showConfirm(this.addroleusername, 'This is an OWNER role. Do you want to continue?', this.confirmAddUserRole, null, null, null, 'danger')
      } else {
        this.confirmAddUserRole()
      }
    },
    async confirmAddUserRole() {
      //console.log('addUserRole', this.addroleuserid, this.chosennewrole)
      try {
        const ok = await api.auth.addUserRole(this.pubid, this.addroleuserid, this.chosennewrole)
        if (ok) {
          await this.usersStore.fetchpubusers(this.pubid)
          this.$nextTick(() => {
            this.showAddRoleModal = false
          })
        } else {
          this.msgBoxFail('User role could not be added')
        }
      } catch (e) {
        this.msgBoxError('Error adding role: ' + e.message)
      }
    },
    async masquerade(pubuser) {
      try {
        const ok = await api.auth.masquerade(pubuser.id)
        if (ok) {
          this.authStore.id = pubuser.id
          this.authStore.name = pubuser.name
          this.authStore.super = false
          this.authStore.masquerading = true
          this.miscStore.clearAll()
          this.pubsStore.clearAll()
          this.submitsStore.clearAll()
          this.usersStore.clearAll()
          navigateTo('/panel')
        } else {
          this.msgBoxFail('Could not masquerade')
        }
      } catch (e) {
        this.msgBoxError('Error masquerading: ' + e.message)
      }
    }
  },
}
</script>
