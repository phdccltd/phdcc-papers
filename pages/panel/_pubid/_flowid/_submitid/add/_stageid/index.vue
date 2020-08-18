<template>
  <!-- ADD ENTRY TO SUBMIT -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else>
      <HelpAdd />
      <Messages :error="error" :message="message" />
      <h2>
        <b-btn variant="link" @click="toggleSubmitShow(submit)" data-hello="brian">
          <v-icon v-if="!submit.visible" name="minus-square" scale="2" />
          <v-icon v-if="submit.visible" name="plus-square" scale="2" />
        </b-btn>
        {{submit.id}}: {{submit.name}} - <span class="status">{{ submit.status}}</span>
      </h2>

      <div v-if="!submit.visible" class="mt-2">
        <b-list-group class="entries">
          <b-list-group-item v-for="(entry, index) in submit.entries" :key="index" class="entry">
            <PaperDate :dt="entry.dt" />
            <b-btn variant="outline-success" :to="'/panel/'+pubid+'/'+flowid+'/'+submit.id+'/'+entry.id">
              {{entry.stage.name}}
            </b-btn>
          </b-list-group-item>
        </b-list-group>
      </div>

      <div v-if="entry">
        <h2 class="border border-primary rounded bg-yellow mt-2 p-2">
          {{sectionheading}}
        </h2>
        <b-form @submit="onSubmit" :xvalidated="true" @submit.stop.prevent>
          <b-container v-for="(field, index) in entry.fields" :key="index" class="mt-2 pl-0">
            <FormInput v-if="field.type=='email'" type="email" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       :class="fieldclass(field)"
                       :message="field.message"
                       v-on:input="changed(field)"
                       v-model="field.val.string" />
            <FormFile v-if="field.type.substring(0,4)=='file'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                      :class="fieldclass(field)"
                      :message="field.message"
                      v-on:input="changed(field)"
                      :existingfile="field.val.file"
                      v-model="field.val.newfile" />
            <FormLookup v-if="field.type=='lookup'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                        :class="fieldclass(field)"
                        :message="field.message"
                        v-on:input="changed(field)"
                        :publookupId="field.publookupId"
                        v-model="field.val.integer" />
            <FormLookups v-if="field.type=='lookups'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                         :class="fieldclass(field)"
                         :message="field.message"
                         v-on:input="changed(field)"
                         :publookupId="field.publookupId"
                         v-model="field.val.string" />
            <FormInput v-if="field.type=='phone'" type="tel" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       :class="fieldclass(field)"
                       :message="field.message"
                       v-on:input="changed(field)"
                       v-model="field.val.string" />
            <FormInput v-if="field.type=='string'" type="text" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       :class="fieldclass(field)"
                       :message="field.message"
                       v-on:input="changed(field)"
                       v-model="field.val.string" />
            <FormText v-if="field.type=='text'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                      :class="fieldclass(field)"
                      :message="field.message"
                      v-on:input="changed(field)"
                      v-model="field.val.text" />
            <FormYes v-if="field.type=='yes'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                     :class="fieldclass(field)"
                     :message="field.message"
                     v-on:input="changed(field)"
                     v-model="field.val.integer" />
            <FormYesNo v-if="field.type=='yesno'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       :class="fieldclass(field)"
                       :message="field.message"
                       v-on:input="changed(field)"
                       v-model="field.val.integer" />
            <!--ADD ENTRY TO SUBMIT: {{field.val.string}} {{field.val.integer}}
        <span v-if="field.val.newfile">
          {{field.val.newfile.name}}
        </span>-->
          </b-container>
          <b-container v-if="editable">
            <b-form-row>
              <b-col cols="9" offset-md="3">
                <b-btn variant="success" type="submit">
                  Submit
                </b-btn>
                <Messages :message="submitstatus" :warning="validationsummary" />
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
  import HelpAdd from '~/components/HelpAdd'
  import Messages from '~/components/Messages'
  import PaperDate from '~/components/PaperDate'
  import FormFile from '~/components/FormFile'
  import FormInput from '~/components/FormInput'
  import FormLookup from '~/components/FormLookup'
  import FormLookups from '~/components/FormLookups'
  import FormText from '~/components/FormText'
  import FormYes from '~/components/FormYes'
  import FormYesNo from '~/components/FormYesNo'
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { HelpAdd, Messages, PaperDate, FormFile, FormInput, FormLookup, FormLookups, FormText, FormYes, FormYesNo },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: '',
        editable: true,
        validationsummary: '',
        submitstatus: '',
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      //console.log('_id mounted', this.pubid)
      this.$store.dispatch('submits/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('submits/fetchpub', this.pubid)
      this.$store.dispatch('submits/fetchformfields', this.stageid)
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
      stageid() {
        return parseInt(this.$route.params.stageid)
      },
      fatalerror() {
        const error1 = this.$store.getters['pubs/error']
        const error2 = this.$store.getters['submits/error']
        return error1 ? error2 ? error1 + ". " + error2 : error1 : error2
      },
      flow() {
        const pub = this.$store.getters['pubs/getPub'](this.pubid)
        if (pub) {
          page.title = pub.name
          document.title = pub.name
          this.$store.commit("page/setTitle", page.title)
        } else {
          this.setError('Invalid pubid')
          return false
        }

        // Get flows and work out follow-on properties
        const flows = this.$store.getters['submits/flows'](this.pubid)
        if (!flows) return false
        const flow = _.find(flows, flow => { return flow.id === this.flowid })
        return flow
      },
      entry() { // Called every time for all user input changes
        const entry = this.$store.getters['submits/stagefields'](this.stageid)
        if (!entry) {
          return false
        }

        const flow = this.flow
        if (flow) {
          entry.stage = _.find(flow.stages, stage => { return stage.id === this.stageid })
        }

        //console.log(entry)
        return entry
      },
      submit() {
        const submit = this.$store.getters['submits/submit'](this.pubid, this.submitid)
        // {{ submit.id }}: {{ submit.name }} - <span class="status">{{ submit.status}}</span>
        return submit
      },
      showSubmitToggle() {
        return !this.$store.getters['misc/get']('entry-submit-toggle')
      },
      sectionheading() {
        const stagename = this.entry.stage.name
        return this.editable ? "Add " + stagename : stagename
      },
    },
    methods: {
      setError(msg) {
        this.error = msg
      },
      setMessage(msg) {
        this.message = msg
      },
      async onSubmit(evt) {
        try {
          this.message = ''
          this.error = ''
          this.validationsummary = ''
          console.log('onSubmit')
          //this.submitForm(this.form)
          const entry = {
            pubid: this.pubid,
            flowid: this.flowid,
            submitid: this.submitid,
            stageid: this.stageid,
            values: [],
          }
          // Repeat basic required validation and do requiredif validation
          let anyerror = false
          for (const field of this.entry.fields) {
            field.message = ''
            const fv = {
              formfieldid: field.id,
              string: field.val.string,
              integer: field.val.integer,
              text: field.val.text,
              //file: field.val.newfile ? field.val.newfile.name : null,
              file: field.val.newfile
            }
            if (field.val.newfile) {
              field.val.file = field.val.newfile.name
            }
            //console.log(field.id, field.type, field.required, field.requiredif, field.val)
            let got = true
            switch (field.type) {
              case 'text':
                got = fv.text !== null && fv.text.length > 0
                break
              case 'string':
              case 'phone':
              case 'email':
              case 'lookups':
                got = fv.string !== null && fv.string.length > 0; break
              case 'yes':
              case 'yesno':
                got = fv.integer !== null
                break
              case 'lookup':
                got = fv.integer !== null
                break
              case 'file':
                got = fv.newfile !== null
                break
            }
            let flagerror = false
            if (field.required) {
              if (!got) {
                flagerror = true
                anyerror = true
                field.message = 'This field is required'
              }
            }
            if (field.requiredif && !got) { // Only copes with: required if <fieldid>=<integer>
              const reffield = parseInt(field.requiredif)
              const eqpos = field.requiredif.indexOf('=')
              const mustequal = parseInt(field.requiredif.substring(eqpos + 1))
              if (reffield && eqpos !== -1) {
                let checkok = false
                for (const checkfield of this.entry.fields) {
                  if (checkfield.id === reffield) {
                    const cfi = checkfield.val.integer
                    if (cfi !== mustequal) {
                      checkok = true
                      break
                    }
                  }
                }
                if (!checkok) {
                  flagerror = true
                  anyerror = true
                  field.message = 'This field is required'
                }
              }
            }
            entry.values.push(fv)
          }
          console.log('onSubmit', entry)
          if (anyerror) {
            this.validationsummary = 'Please fix any issues to continue'
            return
          }
          this.submitstatus = 'Please wait: submitting'
          //const id = await this.$store.dispatch('submits/addEntry', entry) // Get via store so store updated. No need: add then get new entry
          const entryid = await this.$api.submit.addEntry(entry)
          this.submitstatus = false
          this.editable = false
          if (entryid) {
            this.$store.dispatch('misc/set', { key: 'message', value: 'Submitted OK' })
            // OK: redirect so new entry displayed properly
            this.$router.push('/panel/' + this.pubid + '/' + this.flowid + '/' + this.submitid + '/' + entryid)
          } else {
            this.error = 'Save error'
          }
          // Could redirect here: /panel/2/1/3/<id>
          return false
        } catch (e) {
          this.error = e.message
        }
      },
      toggleSubmit() {
        this.$store.dispatch('misc/set', {
          key: 'entry-submit-toggle',
          value: this.showSubmitToggle
        })
      },
      changed(field) {
        field.message = ''
        this.validationsummary = ''
      },
      fieldclass(field) {
        return field.message.length>0 ? 'border border-warning': ''
      },
      toggleSubmitShow(submit) {  // Inverse log in here so submit isn't expanded initially
        submit.visible = !submit.visible
      },
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
