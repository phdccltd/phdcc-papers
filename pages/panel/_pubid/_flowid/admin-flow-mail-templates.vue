<template>
  <!-- ADMIN MAIL TEMPLATES FOR PUBLICATION FLOW -->
  <!-- Access check: correctly fails as API returns error if not allowed -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else-if="!pub.isowner">
      You cannot administer this publication flow
    </div>
    <div v-else>
      <HelpAdminFlowMailTemplates />
      <Messages :error="error" :message="message" />
      <b-list-group class="mailtemplates">
        <b-list-group-item v-for="(mailtemplate, index) in mailtemplates" :key="index" class="pubuser">
          <b-link @click="deleteMailTemplate(mailtemplate)">
            <v-icon name="times-circle" scale="1" class="btn-outline-danger" />
          </b-link>
          {{mailtemplate.id}} {{mailtemplate.name}}
        </b-list-group-item>
        </b-list-group>
      </div>
  </div>
</template>

<script>
  const _ = require('lodash/core')
  import HelpAdminFlowMailTemplates from '~/components/HelpAdminFlowMailTemplates'
  import Messages from '~/components/Messages'
  
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { Messages, HelpAdminFlowMailTemplates },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: '',
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      this.$store.dispatch('mailtemplates/clearError')
      this.$store.dispatch('mailtemplates/fetch', this.flowid)
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
        this.$store.commit("page/setTitleSuffix", 'ADMIN FLOW MAIL')
        return pub
      },
      fatalerror() {
        const error1 = this.$store.getters['users/error']
        return error1
      },
      pubid() {
        return parseInt(this.$route.params.pubid)
      },
      flowid() {
        return parseInt(this.$route.params.flowid)
      },
      mailtemplates() {
        return this.$store.getters['mailtemplates/get'](this.flowid)
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
      async deleteMailTemplate(mailtemplate) {
        if (!await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this template?', { title: mailtemplate.name })) return

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
