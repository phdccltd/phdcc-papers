<template>
  <div>
    <!-- ADMIN SETUP PANEL FOR ONE PUBLICATION -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else-if="!(pub.isowner || issuper)">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdminSetup />
      <Messages :error="error" :message="message" />
      <div class="mb-2">
        <b-badge v-if="!pub.enabled" pill variant="danger">DISABLED FOR USERS</b-badge>
      </div>
      <div>
        <b-button variant="outline-warning" @click="togglePubEnable(pub)">
          {{ pub.enabled ? 'DISABLE' : 'ENABLE' }}
        </b-button>
        <b-button variant="outline-danger" @click="deletePub(pub)" class="float-end">
          DELETE
        </b-button>
      </div>
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

definePageMeta({
  middleware: 'authuser',
})

export default {
  inject: { setLayoutMessage: {} },
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
      confirmpub: null,
    }
  },
  async mounted() { // Client only
    this.setLayoutMessage()
    this.error = ''
    this.message = ''
    await this.pubsStore.clearError()
    await this.pubsStore.fetch()
  },
  computed: {
    pub() {
      const pub = this.pubsStore.getPub(this.pubid)
      if (!pub) {
        this.setError('Invalid pubid')
        return false
      }
      this.miscStore.set({ key: 'page-title', value: pub.name })
      this.miscStore.set({ key: 'page-title-suffix', value: 'ADMIN SETUP' })
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
    issuper() {
      return this.authStore.super
    },
  },
  methods: {
    setError(msg) {
      this.error = msg
    },
    setMessage(msg) {
      this.message = msg
    },

    async togglePubEnable(pub) {
      this.confirmpub = pub
      this.showConfirm(pub.name, 'Are you sure you want to ' + (pub.enabled ? 'disable' : 'enable') + ' this publication?', this.confirmTogglePubEnable)
    },

    async confirmTogglePubEnable() {
      try {
        const ok = await api.pubs.toggleEnablePub(this.confirmpub.id, !this.confirmpub.enabled)
        if (ok) {
          // pub.enabled = !pub.enabled
          await this.pubsStore.fetch()
        } else {
          this.msgBoxFail('Toggling enable went wrong')
        }
      } catch (e) {
        this.msgBoxError('Error toggling enable on publication: ' + e.message)
      }
    },

    async deletePub(pub) {
      this.confirmpub = pub
      this.showConfirm(pub.name, 'Are you sure you want to delete this publication?<br/>CHECK THAT ALL TRACES REMOVED', this.confirmDeletePub, null, null, null, 'danger')
    },

    async confirmDeletePub() {
      console.log('deletePub')
        try {
          const ok = await api.pubs.deletePub(this.confirmpub.id)
          if (ok) {
            await this.pubsStore.fetch()
            this.$nextTick(() => {
              navigateTo('/panel')
            })
          } else {
            this.msgBoxFail('Delete went wrong')
          }
        } catch (e) {
          this.msgBoxError('Error deleting publication: ' + e.message)
        }
    }
  },
}
</script>
