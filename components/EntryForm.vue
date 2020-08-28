<template>
  <!--
  Crucial component that displays a form to add or view - with organisers able to edit and/or delete the entry.
  General hierarchy: publication -> flow -> submit -> entry
  The form is used
    (a) when displaying an entry
    (b) when adding a new submit ie specify flowstageid to add as first of a new submit
    (c) when adding an entry to an existing ie specify flowstageid to add to the submit

  The computed property entry() crucially sets up the (existing or new) entry object with the right fields etc.
  For case (a) above the data is received as entry.values but moved into the relevant field.val.
  For cases (b) and (c) the received entry fields contain empty values - as set ip in store/submits action fetchformfields.
  -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else>
      <HelpAddStage v-if="formtype=='addstage'" />
      <HelpAddSubmit v-if="formtype=='addsubmit'" />
      <HelpEntry v-if="formtype=='showedit'" />
      <Messages :error="error" :message="message" />

      <div v-if="submitid">
        <!-- SHOW SUBMIT SUMMARY -->
        <h2>
          <b-btn variant="link" @click="toggleSubmitShow(submit)">
            <v-icon v-if="!submit.visible" name="minus-square" scale="2" />
            <v-icon v-if="submit.visible" name="plus-square" scale="2" />
          </b-btn>
          {{submit.id}}: {{submit.name}} - <span class="status">{{ submit.status}}</span>
        </h2>

        <div v-if="submit.visible" class="mt-2">
          <b-list-group class="entries">
            <b-list-group-item v-for="(entry, index) in submit.entries" :key="index" class="entry">
              <PaperDate :dt="entry.dt" />
              <b-btn variant="outline-success" :to="'/panel/'+pubid+'/'+flowid+'/'+submit.id+'/'+entry.id">
                {{entry.stage.name}}
              </b-btn>
            </b-list-group-item>
          </b-list-group>
        </div>
      </div>
      <div v-else>
        <h2>{{flow.name}}</h2>
      </div>

      <!-- SHOW EXISTING OR NEW ENTRY -->
      <div v-if="entry">
        <h2 class="border border-primary rounded bg-yellow mt-2 p-2">
          {{sectionheading}}
          <b-btn v-if="showeditviewbutton" variant="outline-success" class="float-left mr-2" @click="toggleEdit">
            {{editbtntext}}
          </b-btn>
          <b-btn v-if="showdeletebutton" variant="outline-warning" class="float-right" @click="deleteEntry">
            Delete
          </b-btn>
        </h2>
        <b-form @submit="onSubmit" @submit.stop.prevent>
          <div v-if="formtype=='addsubmit'" class="mt-2 pl-0 container" >
            <FormInput type="text" :edit="editable" label="Title" sid="field0" help=""
                       :class="fieldclass(submittitle)"
                       :reqd="submittitle.required"
                       :message="submittitle.message"
                       v-on:input="changed(submittitle)"
                       v-model="submittitle.val" />
           </div>
          <b-container v-for="(field, index) in entry.fields" :key="index" class="mt-2 pl-0">
            <FormInput v-if="field.type=='email'" type="email" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       :class="fieldclass(field)"
                       :reqd="field.required"
                       :message="field.message"
                       v-on:input="changed(field)"
                       v-model="field.val.string" />
            <FormFile v-if="field.type.substring(0,4)=='file'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                      :class="fieldclass(field)"
                      :reqd="field.required"
                      :message="field.message"
                      v-on:input="changed(field)"
                      :allowedfiletypes="field.allowedfiletypes"
                      :existingfile="field.val.file"
                      :relpath="entry.id+'/'+field.val.id"
                      v-model="field.val.newfile" />
            <FormLookup v-if="field.type=='lookup'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                        :class="fieldclass(field)"
                        :reqd="field.required"
                        :message="field.message"
                        v-on:input="changed(field)"
                        :publookupId="field.publookupId"
                        v-model="field.val.integer" />
            <FormLookups v-if="field.type=='lookups'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                         :class="fieldclass(field)"
                         :reqd="field.required"
                         :message="field.message"
                         v-on:input="changed(field)"
                         :publookupId="field.publookupId"
                         v-model="field.val.string" />
            <FormInput v-if="field.type=='phone'" type="tel" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       :class="fieldclass(field)"
                       :reqd="field.required"
                       :message="field.message"
                       v-on:input="changed(field)"
                       v-model="field.val.string" />
            <FormInput v-if="field.type=='string'" type="text" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       :class="fieldclass(field)"
                       :reqd="field.required"
                       :message="field.message"
                       v-on:input="changed(field)"
                       v-model="field.val.string" />
            <FormText v-if="field.type=='text'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                      :class="fieldclass(field)"
                      :reqd="field.required"
                      :message="field.message"
                      v-on:input="changed(field)"
                      v-model="field.val.text" />
            <FormYes v-if="field.type=='yes'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                     :class="fieldclass(field)"
                     :reqd="field.required"
                     :message="field.message"
                     v-on:input="changed(field)"
                     v-model="field.val.integer" />
            <FormYesNo v-if="field.type=='yesno'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       :class="fieldclass(field)"
                       :reqd="field.required"
                       :message="field.message"
                       v-on:input="changed(field)"
                       v-model="field.val.integer" />
          </b-container>
          <b-container v-if="editable">
            <b-form-row>
              <b-col cols="9" offset-md="3">
                <b-btn variant="success" type="submit">
                  Submit
                </b-btn>
                <Messages :message="submitstatus" :warning="validationsummary" :error="submiterror" />
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
  import HelpAddStage from '~/components/HelpAddStage'
  import HelpAddSubmit from '~/components/HelpAddSubmit'
  import HelpEntry from '~/components/HelpEntry'
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

  export default {
    components: { HelpAddStage, HelpAddSubmit, HelpEntry, Messages, PaperDate, FormFile, FormInput, FormLookup, FormLookups, FormText, FormYes, FormYesNo },
    data() {
      return {
        error: '',
        message: '',
        editable: false,
        validationsummary: '',
        submitstatus: '',
        submiterror: '',
        showeditviewbutton: false,
        showdeletebutton: false,
        submittitle: {
          required: true,
          message: '',
          val: '',
        }
      }
    },
    props: {
      formtype: { type: String },
    },
    mounted() {
      switch (this.formtype) {
        case 'showedit':
          this.showeditviewbutton = true // TODO: only set if admin
          this.showdeletebutton = true // TODO: only set if admin
          break
        case 'addsubmit':
          this.editable = true
          this.showeditviewbutton = false
          this.showdeletebutton = false
          break
        case 'addstage':
          this.editable = true
        default:
      }
      this.error = ''
      this.message = this.$store.getters['misc/get']('message')
      this.$store.dispatch('misc/set', { key: 'message', value: '' })
      this.$store.dispatch('submits/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('submits/fetchpub', this.pubid)
      if (this.stageid) {
        this.$store.dispatch('submits/fetchformfields', this.stageid)
      }
      if (this.entryid) {
        this.$store.dispatch('submits/fetchentry', this.entryid)
      }
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
      entryid() { // Some routes
        return parseInt(this.$route.params.entryid)
      },
      stageid() { // Some routes
        return parseInt(this.$route.params.stageid)
      },
      fatalerror() {
        const error1 = this.$store.getters['pubs/error']
        const error2 = this.$store.getters['submits/error']
        return error1 ? error2 ? error1 + ". " + error2 : error1 : error2
      },
      editbtntext() {
        return this.editable ? 'View' : 'Edit'
      },
      flow() {
        const flows = this.$store.getters['submits/flows'](this.pubid)
        if (!flows) return false
        const flow = _.find(flows, flow => { return flow.id === this.flowid })
        return flow
      },
      submit() {
        //console.log('###GET SUBMIT')
        // Naughtily get pub here
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
      entry() { // Called every time for all user input changes
        if (this.stageid) {
          console.log('###GET ENTRY VIA STAGEID')
          const entry = this.$store.getters['submits/stagefields'](this.stageid)
          if (!entry) return false

          const flow = this.flow
          if (!flow) return false
          entry.stage = _.find(flow.stages, stage => { return stage.id === this.stageid })

          //console.log(entry)
          return entry
        }
        if (this.entryid) {
          console.log('###GET ENTRY VIA ENTRYID')
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
            field.val.newfile = null
            console.log("NEWFILE SET TO NULL")
          }
          //console.log(entry)
          return entry
        }
      },
      showSubmitToggle() {
        return !this.$store.getters['misc/get']('entry-submit-toggle')
      },
      sectionheading() {
        const stagename = this.entry.stage.name
        return (this.editable ? (this.showeditviewbutton ? 'Edit ' : 'Add ') : '') + stagename
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
          if (this.entryid) entry.id = this.entryid
          // Do required validation and do requiredif validation
          let anyerror = false
          if (this.formtype == 'addsubmit') {
            if (this.submittitle.val.length == 0) {
              this.submittitle.message = 'This field is required'
              anyerror = true
            }
          }
          for (const field of this.entry.fields) {
            field.message = ''
            const fv = {
              formfieldid: field.id,
              string: field.val.string,
              integer: field.val.integer,
              text: field.val.text,
              //file: field.val.newfile ? field.val.newfile.name : null,
              existingfile: field.val.file,
              file: field.val.newfile,
            }
            if (field.val.newfile) { // View filename
              field.val.file = field.val.newfile.name
            }
            //console.log(field.id, field.type, field.required, field.requiredif, field.val)
            let got = true
            let lengthalreadywarned = false
            //console.log(field.type, field.label, fv.string)
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
                got = fv.existingfile!=null || fv.file !== null
                break
            }
            if (field.required) {
              if (!got) {
                anyerror = true
                field.message = 'This field is required. '
              }
            }
            if (field.maxchars || field.maxwords) {
              let tocheckmax = false
              if (field.type === 'string') {
                if (fv.string !== null) tocheckmax = fv.string
              }
              if (field.type === 'text') {
                if (fv.text !== null) tocheckmax = fv.text
              }
              if (field.maxchars && tocheckmax) {
                if (tocheckmax.length > field.maxchars) {
                  field.message += 'You have ' + tocheckmax.length + ' characters - the maximum is ' + field.maxchars + '. '
                  anyerror = true
                  lengthalreadywarned = true
                }
              }
              if (field.maxwords && tocheckmax) {
                const matches = tocheckmax.match(/\S+/g);
                if (matches && (matches.length > field.maxwords)) {
                  field.message += 'You have ' + matches.length + ' words - the maximum is ' + field.maxwords + '. '
                  anyerror = true
                  lengthalreadywarned = true
                }
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
                  anyerror = true
                  field.message = 'This field is required. '
                }
              }
            }
            if ((fv.string !== null) && (!lengthalreadywarned) && (fv.string.length > 255)) { // String simply truncated to 255 in API
              anyerror = true
              field.message = 'The maximum string length is 255 characters. '
            }
            entry.values.push(fv)
          }
          console.log('onSubmit', entry)
          if (anyerror) {
            this.validationsummary = 'Please fix any issues to continue'
            return
          }

          this.submitstatus = 'Please wait: submitting'
          this.submiterror = ''
          if (this.formtype == 'addsubmit') { // ADD SUBMIT AND ENTRY
            entry.submitid = 0
            entry.title = this.submittitle.val
            const data = await this.$api.submit.addSubmitEntry(entry, this.flowid)
            console.log('RECEIVED',data)
            const entryid = data.rv.id
            this.submitstatus = ''
            if (entryid) {
              this.editable = false
              this.$store.dispatch('misc/set', { key: 'message', value: 'Submitted OK' })
              // OK: redirect so new entry displayed properly
              this.$router.push('/panel/' + this.pubid + '/' + this.flowid + '/' + data.rv.submitid + '/' + entryid)
            } else {
              this.error = 'Save error'
            }
          } else if (this.entryid) {  // EDIT ENTRY
            const returnedid = await this.$api.submit.editEntry(entry)
            this.submitstatus = ''
            if (returnedid) {
              this.editable = false
              this.message = 'Updated OK'
              this.$store.dispatch('submits/fetchentry', this.entryid) // To get file relpath anew
            } else {
              this.error = 'Save error'
              this.submiterror = 'Save error'
            }
          } else { // ADD ENTRY
            //const id = await this.$store.dispatch('submits/addEntry', entry) // Get via store so store updated. No need: add then get new entry
            const data = await this.$api.submit.addEntry(entry)
            const entryid = data.rv.id
            this.submitstatus = ''
            if (entryid) {
              this.editable = false
              this.$store.dispatch('misc/set', { key: 'message', value: 'Submitted OK' })
              // OK: redirect so new entry displayed properly
              this.$router.push('/panel/' + this.pubid + '/' + this.flowid + '/' + this.submitid + '/' + entryid)
            } else {
              this.error = 'Save error'
              this.submiterror = 'Save error'
            }
            // Could redirect here: /panel/2/1/3/<id>
          }
          return false
        } catch (e) {
          this.error = e.message
          this.submiterror = e.message
          this.submitstatus = ''
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
        //console.log('---fieldclass', field)
        return field.message.length > 0 ? 'border border-warning' : ''
      },
      toggleSubmitShow(submit) {  // Inverse log in here so submit isn't expanded initially
        submit.visible = !submit.visible
      },
      toggleEdit() {
        this.editable = !this.editable
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
          await this.$bvModal.msgBoxOk('Note: no statuses removed', { title: 'Entry deleted' })
          this.$router.push('/panel/' + this.pubid)
        } catch (e) {
          this.error = e.message
        }
      }
    }
  }
</script>
<style>
  .status {
    font-weight: bold;
    color: green;
  }
</style>
