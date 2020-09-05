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
      <b-container class="bg-yellow p-3">
        <b-row no-gutters>
          <b-col sm="6">
            <strong>{{flow.name}}:</strong>
            <b-btn variant="outline-success" @click="startAddMailTemplate()">
              Add mail template
            </b-btn>
          </b-col>
          <b-col sm="6">
            <b-btn variant="outline-success" @click="toggleShowSubstitutions()">
              Show substitution strings
            </b-btn>
            <b-form-textarea v-if="showsubstitutions" plaintext :value="substitutions" max-rows="100" style="overflow-y: auto;"></b-form-textarea>
          </b-col>
        </b-row>
      </b-container>
      <b-list-group class="mailtemplates">
        <b-list-group-item v-for="(mailtemplate, index) in mailtemplates" :key="index" class="pubuser">
          <h3 class="publist-submit-h3">
            <b-link @click="deleteMailTemplate(mailtemplate)">
              <v-icon name="times-circle" scale="1" class="btn-outline-danger" />
            </b-link>
            <b-link @click="toggleTemplateShow(mailtemplate)">
              {{mailtemplate.id}}: {{mailtemplate.name}}
            </b-link>
            <b-btn variant="link" @click="startEditMailTemplate(mailtemplate)">
              <v-icon name="edit" scale="1.5" class="btn-outline-warning" />
            </b-btn>
          </h3>
          <b-container v-if="mailtemplate.visible">
            <b-row no-gutters>
                <b-col sm="2">
                  Subject
                </b-col>
                <b-col sm="10" class="formfieldview">
                  {{mailtemplate.subject}}
                </b-col>
            </b-row>
            <b-row no-gutters>
              <b-col sm="2">
                Body
              </b-col>
              <b-col sm="10" class="formfieldview">
                <b-form-textarea plaintext :value="mailtemplate.body" max-rows="100" style="overflow-y: auto;"></b-form-textarea>
              </b-col>
            </b-row>
          </b-container>
        </b-list-group-item>
      </b-list-group>
    </div>
    <b-modal id="bv-modal-mail-template" size="xl" centered @ok="okMailTemplate">
      <template v-slot:modal-title>
        {{modaltitle}}
      </template>
      <form ref="form" @submit.stop.prevent>
        <b-form-group label="Name"
                      label-for="templatename"
                      label-cols-sm="2">
          <b-form-input id="templatename" v-model="templatename" placeholder="Required" required></b-form-input>
        </b-form-group>
        <b-form-group label="Subject"
                      label-for="templatesubject"
                      label-cols-sm="2">
          <b-form-input id="templatesubject" v-model="templatesubject" placeholder="Required" required></b-form-input>
        </b-form-group>
        <b-form-group label="Body"
                      label-for="templatebody"
                      label-cols-sm="2">
          <b-form-textarea id="templatebody"
                           v-model="templatebody"
                           rows="10"
                           max-rows="100"
                           style="overflow-y: auto;"
                           placeholder="Required"
                           required>
          </b-form-textarea>
        </b-form-group>
      </form>
    </b-modal>
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
        modaltitle: 'UNSET',
        templateid: 0,
        templatename: '',
        templatesubject: '',
        templatebody: '',
        showsubstitutions: false,
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      this.$store.dispatch('mailtemplates/clearError')
      this.$store.dispatch('mailtemplates/fetch', this.flowid)
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('submits/fetchpub', this.pubid)
      // TODO: Fix as this won't work first time round
      const flow = this.flow
      for (const stage of flow.stages) {
        this.$store.dispatch('submits/fetchformfields', stage.id)
      }
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
      flow() {
        // Get flows and work out follow-on properties
        let flows = this.$store.getters['submits/flows'](this.pubid)
        if (!flows) return false
        const flow = _.find(flows, flow => { return flow.id === this.flowid })
        return flow
      },
      mailtemplates() {
        return this.$store.getters['mailtemplates/get'](this.flowid)
      },
      substitutions() {
        let substitutions = '{{submit.id}}\r{{submit.name}}\r{{user.username}}\r{{user.id}}\r{{now}}\r\r{{entry.id}}\r'
        const flow = this.flow
        for (const stage of flow.stages) {
          substitutions += '\r' + stage.name + ':\r'
          const entry = this.$store.getters['submits/stagefields'](stage.id)
          for (const field of entry.fields) {
            substitutions += '{{entry.field_' + field.id + '}} ' + field.label + '\r'
          }
        }
        return substitutions
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
      /* ************************ */
      toggleShowSubstitutions() {
        this.showsubstitutions = !this.showsubstitutions
      },
      /* ************************ */
      toggleTemplateShow(mailtemplate) {
        mailtemplate.visible = !mailtemplate.visible
      },
      /* ************************ */
      async deleteMailTemplate(mailtemplate) {
        try {
          if (!await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this template?', { title: mailtemplate.name })) return
          this.$bvModal.msgBoxOk('NOT IMPLEMENTED')
        } catch (e) {
          this.$bvModal.msgBoxOk('Error adding template: ' + e.message)
        }
      },
      /* ************************ */
      startAddMailTemplate() {
        this.modaltitle = 'Add mail template'
        this.templateid = 0
        this.templatename = ''
        this.templatesubject = ''
        this.templatebody = ''
        this.$bvModal.show('bv-modal-mail-template')
      },
      /* ************************ */
      startEditMailTemplate(mailtemplate) {
        this.modaltitle = 'Edit mail template'
        this.templateid = mailtemplate.id
        this.templatename = mailtemplate.name
        this.templatesubject = mailtemplate.subject
        this.templatebody = mailtemplate.body
        this.$bvModal.show('bv-modal-mail-template')
      },
      /* ************************ */
      async okMailTemplate(bvModalEvt) {
        //console.log('addMailTemplate', this.templateid, this.templatename, this.templatesubject, this.templatebody)
        bvModalEvt.preventDefault()
        try {
          this.templatename = this.templatename.trim()
          this.templatesubject = this.templatesubject.trim()
          this.templatebody = this.templatebody.trim()
          if (this.templatename.length === 0) return await this.$bvModal.msgBoxOk('Please give a name')
          if (this.templatesubject.length === 0) return await this.$bvModal.msgBoxOk('Please give a subject')
          if (this.templatebody.length === 0) return await this.$bvModal.msgBoxOk('Please give a body')

          const ok = await this.$api.mailtemplates.addEditMailTemplate(this.flowid, this.templateid, this.templatename, this.templatesubject, this.templatebody)

          if (ok) {
            this.$store.dispatch('mailtemplates/fetch', this.flowid)
            this.$bvToast.toast('Mail template added/edited', {
              title: this.templatename,
              toaster: 'b-toaster-top-center',
              variant: 'success',
            })
            this.$nextTick(() => {
              this.$bvModal.hide('bv-modal-mail-template')
            })
          } else {
            this.$bvToast.toast('Add/Edit went wrong', {
              title: this.templatename,
              toaster: 'b-toaster-top-center',
              variant: 'danger',
            })
          }
        } catch (e) {
          this.$bvModal.msgBoxOk('Error adding template: ' + e.message)
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
