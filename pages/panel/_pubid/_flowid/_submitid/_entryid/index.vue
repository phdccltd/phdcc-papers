<template>
  <!-- ENTRY LISTING: SHOW OR EDIT -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else>
      <HelpEntry />
      <Messages :error="error" :message="message" />
      <h2>
        <b-btn v-b-toggle.collapse-1 variant="link" class="float-right" @click="toggleSubmit">
          <v-icon name="plus-square" scale="2" />
        </b-btn>
        {{submit.id}}: {{submit.name}} - <span class="status">{{ submit.status}}</span>
      </h2>

      <b-collapse :visible="showSubmitToggle" id="collapse-1" class="mt-2">
        <b-list-group class="entries">
          <b-list-group-item v-for="(entry, index) in submit.entries" :key="index" class="entry">
            <PaperDate :dt="entry.dt" />
            <b-btn variant="outline-success" :to="'/panel/'+pubid+'/'+flowid+'/'+submit.id+'/'+entry.id">
              {{entry.stage.name}}
            </b-btn>
          </b-list-group-item>
        </b-list-group>
      </b-collapse>

      <div v-if="entry">
        <h2 class="border border-primary rounded bg-yellow mt-2 p-2">
          {{ entry.stage.name }}
          <b-btn variant="outline-success" class="float-left mr-2" @click="toggleEdit">
            {{editbtntext}}
          </b-btn>
          <b-btn variant="outline-warning" class="float-right" @click="deleteEntry">
            Delete
          </b-btn>
        </h2>
        <b-form @submit="onSubmit" :xvalidated="true" @submit.stop.prevent>
          <b-container v-for="(field, index) in entry.fields" :key="index" class="mt-2 pl-0">

            <FormInput v-if="field.type=='email'" type="email" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       v-bind:reqd="field.required"
                       v-model="field.val.string" />
            <FormFile v-if="field.type.substring(0,4)=='file'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                      v-bind:reqd="field.required"
                      :existingfile="field.val.file"
                      :relpath="entry.id+'/'+field.val.id"
                      v-model="field.val.newfile" />
            <FormLookup v-if="field.type=='lookup'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                        :publookupId="field.publookupId"
                        v-bind:reqd="field.required"
                        v-model="field.val.integer" />
            <FormLookups v-if="field.type=='lookups'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                         :publookupId="field.publookupId"
                         v-bind:reqd="field.required"
                         v-model="field.val.string" />
            <FormInput v-if="field.type=='phone'" type="tel" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       v-bind:reqd="field.required"
                       v-model="field.val.string" />
            <FormInput v-if="field.type=='string'" type="text" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       v-bind:reqd="field.required"
                       v-model="field.val.string" />
            <FormText v-if="field.type=='text'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                      v-bind:reqd="field.required"
                      v-model="field.val.text" />
            <FormYesNo v-if="field.type=='yesno'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       v-bind:reqd="field.required"
                       v-model="field.val.integer" />
            <!--{{field.val.string}} {{field.val.integer}} {{field.val.file}}
            <span v-if="field.val.newfile">
              {{field.val.newfile.name}}
            </span>-->
          </b-container>
          <b-container v-if="editable">
            <b-form-row>
              <b-col cols="9" offset-md="3">
                <b-btn>
                  Submit
                </b-btn>
              </b-col>
            </b-form-row>
          </b-container>
        </b-form>
      </div>
    </div>
  </div>
</template>

<script>
  const _ = require('lodash/core')
  import HelpEntry from '~/components/HelpEntry'
  import Messages from '~/components/Messages'
  import PaperDate from '~/components/PaperDate'
  import FormFile from '~/components/FormFile'
  import FormInput from '~/components/FormInput'
  import FormLookup from '~/components/FormLookup'
  import FormLookups from '~/components/FormLookups'
  import FormText from '~/components/FormText'
  import FormYesNo from '~/components/FormYesNo'
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { HelpEntry, Messages, PaperDate, FormFile, FormInput, FormLookup, FormLookups, FormText, FormYesNo  },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: '',
        editable: false,
        editbtntext: 'Edit',
      }
    },
    async mounted() { // Client only
      this.error = ''
      //console.log('_id mounted', this.pubid)
      this.message = this.$store.getters['misc/get']('message')
      this.$store.dispatch('misc/set', { key: 'message', value: '' })
      this.$store.dispatch('submits/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('submits/fetchpub', this.pubid)
      this.$store.dispatch('submits/fetchentry', this.entryid)
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
      entryid() {
        return parseInt(this.$route.params.entryid)
      },
      fatalerror() {
        const error1 = this.$store.getters['pubs/error']
        const error2 = this.$store.getters['submits/error']
        return error1?error2?error1+". "+error2:error1:error2
      },
      entry() {
        const flows = this.$store.getters['submits/flows'](this.pubid)
        if (!flows) return false

        const entry = this.$store.getters['submits/entry'](this.entryid)
        if (!entry) return false

        const flow = _.find(flows, flow => { return flow.id === this.flowid })
        if (!flow) return false

        entry.stage = _.find(flow.stages, stage => { return stage.id === entry.flowstageId })

        for (const field of entry.fields) {
          const val = _.find(entry.values, value => { return value.formfieldId === field.id })
          field.val = val || {}
        }
        //console.log("publookups",entry.publookups)

        //console.log(entry)
        return entry
      },
      submit() {
        const pub = this.$store.getters['pubs/getPub'](this.pubid)
        if (pub) {
          page.title = pub.name
          document.title = pub.name
          this.$store.commit("page/setTitle", page.title)
        } else {
          this.setError('Invalid pubid')
          return false
        }

        const submit = this.$store.getters['submits/submit'](this.pubid, this.submitid)
        return submit
      },
      showSubmitToggle() {
        return !this.$store.getters['misc/get']('entry-submit-toggle')
      },
    },
    methods: {
      setError(msg) {
        this.error = msg
      },
      setMessage(msg) {
        this.message = msg
      },
      onSubmit(evt) {
        console.log('this.form', this.form)
        //this.submitForm(this.form)
      },
      toggleSubmit() {
        this.$store.dispatch('misc/set', {
          key: 'entry-submit-toggle',
          value: this.showSubmitToggle
        })
      },
      toggleEdit() {
        this.editable = !this.editable
        this.editbtntext = this.editable ? 'View' :'Edit'
      },
      async deleteEntry() {
        try {
          this.error = ''
          const OK = await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this entry?')
          if (!OK) return
          const deleted = await this.$api.submit.deleteEntry(this.entryid)
          if (!deleted) {
            this.error = 'Could not delete this entry'
            return
          }
          await this.$bvModal.msgBoxOk('Entry deleted')
          this.$router.push('/panel/' + this.pubid)
        } catch (e) {
          this.error = e.message
        }
      }
    },
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
<style>
  .status{
    font-weight: bold;
    color: green;
  }
</style>
