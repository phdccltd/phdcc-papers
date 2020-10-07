<template>
  <!-- PANEL FOR A SUBMISSION -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else>
      <HelpPanelSubmit />
      <Messages :error="error" :message="message" />
      <div v-if="pub.isowner" class="pl-1 mt-1 mb-1">
        <strong>ADMIN</strong>
        <b-btn variant="outline-warning" @click="toggleShowAdminOptions()">Show/Hide admin options</b-btn>
      </div>
      <div class="pl-1">
        Your roles
        <strong v-if="$auth.user.super">SUPERADMIN</strong>
        <span v-for="myrole in pub.myroles">
          - {{myrole.name}}
        </span>
      </div>
      <SubmitSummary :showtype="2" :pub="pub" :flow="flow" :submit="submit" :showingadminoptions="showingadminoptions" :editSubmitName="editSubmitName" />
    </div>

    <b-modal id="bv-modal-edit-submit-title" centered @ok="okTitleEdited">
      <template v-slot:modal-title>
        Edit submission title
      </template>
      <form ref="form" @submit.stop.prevent>
        <b-form-group label="Title"
                      label-for="new-title"
                      invalid-feedback="Title is required">
          <b-form-input id="new-title" required v-model="newtitle"></b-form-input>
        </b-form-group>
      </form>
    </b-modal>

  </div>
</template>

<script>
  const _ = require('lodash/core')
  import HelpPanelSubmit from '~/components/HelpPanelSubmit'
  import Messages from '~/components/Messages'
  import SubmitSummary from '~/components/SubmitSummary'
  
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { Messages, HelpPanelSubmit, SubmitSummary },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: '',
        showingadminoptions: false,
        submitbeingedited: false,
        newtitle: '',
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      //console.log('_id mounted', this.pubid)
      this.$store.dispatch('pubs/clearError')
      this.$store.dispatch('submits/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('submits/fetchpub', this.pubid)
    },
    computed: {
      pubid() {
        return parseInt(this.$route.params.pubid)
      },
      flowid() {
        return parseInt(this.$route.params.flowid)
      },
      submitid() {
        return parseInt(this.$route.params.submitid)
      },
      fatalerror() {
        const error1 = this.$store.getters['pubs/error']
        const error2 = this.$store.getters['submits/error']
        return error1 ? error2 ? error1 + ". " + error2 : error1 : error2
      },
      pub() {
        const pub = this.$store.getters['pubs/getPub'](this.pubid)
        if (!pub) {
          this.setError('Invalid pubid')
          return false
        }
        // pub.isowner = true // Do this when testing faked API access restriction
        page.title = pub.name
        document.title = pub.name
        this.$store.commit("page/setTitle", page.title)
        return pub
      },
      flow() {
        const flows = this.$store.getters['submits/flows'](this.pubid)
        if (!flows) return false
        const flow = _.find(flows, flow => { return flow.id === this.flowid })
        return flow
      },
      submit() {
        const submit = this.$store.getters['submits/submit'](this.pubid, this.submitid)
        return submit
      },
    },
    methods: {
      setError(msg) {
        this.error = msg
      },
      setMessage(msg) {
        this.message = msg
      },
      toggleShowAdminOptions() {
        this.showingadminoptions = !this.showingadminoptions
      },

      editSubmitName(submit) { // These three methods are also in PublicationSubmissions ie duplicated
        this.newtitle = submit.name
        this.submitbeingedited = submit
        this.$bvModal.show('bv-modal-edit-submit-title')
      },
      okTitleEdited(bvModalEvt) {
        bvModalEvt.preventDefault()
        this.doEditTitle()
      },
      async doEditTitle() {
        try {
          const newtitle = this.newtitle.trim()
          if (newtitle.length === 0) return await this.$bvModal.msgBoxOk('No new title given!')
          const amended = await this.$api.submit.changeSubmitTitle(this.submitbeingedited, newtitle)
          if (!amended) return await this.$bvModal.msgBoxOk('Error changing title')
          this.$store.dispatch('submits/fetchpub', this.pubid)
          this.$nextTick(() => {
            this.$bvModal.hide('bv-modal-edit-submit-title')
            this.$bvModal.msgBoxOk('Title changed')
          })
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error changing title: ' + e.message)
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
