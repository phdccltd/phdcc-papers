<template>
  <!-- ADMIN SETUP PANEL FOR ONE PUBLICATION -->
  <!-- Access check: correctly fails as API returns error if not allowed -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else-if="!(pub.isowner || $auth.user.super)">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdminSetup />
      <Messages :error="error" :message="message" />
      <div class="mb-2">
        <b-badge v-if="!pub.enabled" pill variant="danger">DISABLED FOR USERS</b-badge>
      </div>
      <div>
        <b-btn variant="outline-warning" @click="togglePubEnable(pub)">
          {{ pub.enabled?'DISABLE':'ENABLE'}}
        </b-btn>
        <b-btn variant="outline-danger" @click="deletePub(pub)" class="float-right">
          DELETE
        </b-btn>
      </div>
    </div>
  </div>
</template>

<script>
  const _ = require('lodash/core')
  import HelpAdminSetup from '~/components/HelpAdminSetup'
  import Messages from '~/components/Messages'
  import { BBadge } from 'bootstrap-vue'
  import { page } from '@/utils/page'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { Messages, HelpAdminSetup, BBadge },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: ''
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      this.$store.dispatch('pubs/clearError')
      this.$store.dispatch('pubs/fetch')
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
        this.$store.commit("page/setTitleSuffix", 'ADMIN SETUP')
        return pub
      },
      fatalerror() {
        const error1 = this.$store.getters['users/error']
        return error1
      },
      pubid() {
        //console.log('PUB pubid')
        return parseInt(this.$route.params.pubid)
      }
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

      async togglePubEnable(pub) {
        console.log('togglePubEnable')
        const OK = await this.$bvModal.msgBoxConfirm('Are you sure you want to ' + (pub.enabled ? 'disable' : 'enable') + ' this publication?')
        if (OK) {
          try {
            const ok = await this.$api.pub.toggleEnablePub(pub.id, !pub.enabled)
            if (ok) {
              // pub.enabled = !pub.enabled
              this.$store.dispatch('pubs/fetch')
            } else {
              await this.$bvModal.msgBoxOk('Toggling enable went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
            }
          } catch (e) {
            await this.$bvModal.msgBoxOk('Error toggling enable on publication: ' + e.message)
          }
        }
      },

      async deletePub(pub) {
        console.log('deletePub')
        const OK = await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this publication?', { title: 'CHECK THAT ALL TRACES REMOVED', okVariant: 'danger', okTitle: 'YES', cancelTitle: 'NO', })
        if (OK) {
          try {
            const ok = await this.$api.pub.deletePub(pub.id)
            if (ok) {
              this.$store.dispatch('pubs/fetch')
              this.$nextTick(() => {
                this.$bvModal.msgBoxOk('Publication deleted')
              })
            } else {
              await this.$bvModal.msgBoxOk('Delete went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
            }
          } catch (e) {
            await this.$bvModal.msgBoxOk('Error deleting publication: ' + e.message)
          }
        }
      }
    },
    /* ************************ */
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
