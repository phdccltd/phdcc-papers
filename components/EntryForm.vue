<template>
  <div>
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
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else>
      <HelpAddStage v-if="formtype == 'addstage'" />
      <HelpAddSubmit v-if="formtype == 'addsubmit'" />
      <HelpEntry v-if="formtype == 'showedit'" />
      <Messages :error="error" :message="message" />

      <div class="pl-1">
        Your roles
        <strong v-if="issuper">SUPERADMIN</strong>
        <span v-for="myrole in pub.myroles">
          - {{ myrole.name }}
        </span>
      </div>

      <div v-if="submitid">
        <SubmitSummary :showtype="4" :pub="pub" :flow="flow" :submit="submit" :showingadminoptions="false" :setError="setError"
          :setMessage="setMessage" />
      </div>
      <div v-else>
        <h2>{{ flow.name }}</h2>
      </div>

      <!-- SHOW EXISTING OR NEW ENTRY -->
      <div v-if="entry">
        <h2 class="border border-primary rounded bg-yellow mt-2 p-2">
          {{ sectionheading }}
          <b-button v-if="pub.isowner && showingadminoptions" variant="outline-success" class="float-start me-2" @click="toggleEdit">
            {{ editbtntext }}
          </b-button>
          <b-button v-if="pub.isowner && showingadminoptions" variant="outline-warning" class="float-end" @click="deleteEntry(entry)">
            Delete
          </b-button>
        </h2>
        <b-form @submit="onSubmit" @submit.stop.prevent>
          <div v-if="formtype == 'addsubmit'" class="mt-2 pl-0 container">
            <FormInput type="text" :edit="editable" label="Paper title" sid="field0" help="" :class="fieldclass(submittitle)"
              :reqd="submittitle.required" :message="submittitle.message" v-on:input="changed(submittitle)" v-model="submittitle.val" />
          </div>
          <b-container v-for="(field, index) in entry.fields" :key="index" class="mt-2 pl-0">
            <FormInput v-if="field.type == 'email'" type="email" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" v-on:input="changed(field)"
              v-model="field.val.string" />
            <FormFile v-if="field.type.substring(0, 4) == 'file'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message"
              v-on:input="changedFile($event, field)" :allowedfiletypes="field.allowedfiletypes" :existingfile="field.val.file"
              :relpath="entry.id + '/' + field.val.id" />
            <FormLookup v-if="field.type == 'lookup'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" v-on:input="changed(field)"
              :publookupId="field.publookupId" v-model="field.val.integer" />
            <FormLookups v-if="field.type == 'lookups'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" v-on:input="changed(field)"
              :publookupId="field.publookupId" v-model="field.val.string" />
            <FormRoleLookups v-if="field.type == 'rolelookups'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" v-on:input="changed(field)"
              :pubroleId="field.pubroleId" v-model="field.val.string" />
            <FormInput v-if="field.type == 'phone'" type="tel" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" v-on:input="changed(field)"
              v-model="field.val.string" />
            <FormInput v-if="field.type == 'string'" type="text" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" v-on:input="changed(field)"
              v-model="field.val.string" />
            <FormText v-if="field.type == 'text'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" v-on:input="changed(field)"
              v-model="field.val.text" />
            <FormYes v-if="field.type == 'yes'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" v-on:input="changed(field)"
              v-model="field.val.integer" />
            <FormYesNo v-if="field.type == 'yesno'" :edit="editable" :label="field.label" :sid="'field' + field.id" :help="field.help"
              :helplink="field.helplink" :class="fieldclass(field)" :reqd="field.required" :message="field.message" v-on:input="changed(field)"
              v-model="field.val.integer" />
          </b-container>
          <b-container v-if="editable">
            <b-form-row>
              <b-col cols="9" offset-md="3">
                <b-button variant="success" type="submit">
                  Submit
                </b-button>
                <Messages :message="submitstatus" :warning="validationsummary" :error="submiterror" />
              </b-col>
            </b-form-row>
          </b-container>
        </b-form>
      </div>
    </div>
    <MessageBoxOK ref="okmsgbox" />
    <ConfirmModal ref="confirm" :title="confirmTitle" :message="confirmMessage" :cancelText="confirmCancelText" :confirmText="confirmOKText"
      @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import _ from 'lodash/core'
import api from '~/api'
import modalBoxes from '@/mixins/modalBoxes'

export default {
  mixins: [modalBoxes],
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()

    return { authStore, miscStore, pubsStore, submitsStore }
  },
  data() {
    return {
      error: '',
      message: '',
      editable: false,
      validationsummary: '',
      submitstatus: '',
      submiterror: '',
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
  async mounted() {
    if (this.formtype === 'addstage' || this.formtype === 'addsubmit') {
      this.editable = true
    }
    this.error = ''
    //TODO this.message = this.$store.getters['misc/get']('message')
    //TODO this.$store.dispatch('misc/set', { key: 'message', value: '' })
    await this.pubsStore.clearError()
    await this.submitsStore.clearError()
    await this.pubsStore.fetch()
    await this.submitsStore.fetchpub(this.pubid)
    if (this.stageid) {
      await this.submitsStore.fetchformfields(this.stageid)
    }
    if (this.entryid) {
      await this.submitsStore.fetchentry(this.entryid)
    }
  },
  computed: {
    issuper() {
      return this.authStore.super
    },
    pubid() {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    flowid() {
      const route = useRoute()
      return parseInt(route.params.flowid)
    },
    submitid() {
      const route = useRoute()
      return parseInt(route.params.submitid)
    },
    entryid() { // Some routes
      const route = useRoute()
      return parseInt(route.params.entryid)
    },
    stageid() { // Some routes
      const route = useRoute()
      return parseInt(route.params.stageid)
    },
    fatalerror() {
      const error1 = this.pubsStore.error;
      const error2 = this.submitsStore.error;
      return error1 ? error2 ? error1 + ". " + error2 : error1 : error2
    },
    editbtntext() {
      const isadd = this.formtype == 'addsubmit'
      return this.editable ? 'View' : 'Edit'
    },
    pub() {
      const pub = this.pubsStore.getPub(this.pubid)
      if (!pub) {
        this.setError('Invalid pubid')
        return false
      }
      // pub.isowner = true // Do this when testing faked API access restriction
      this.miscStore.set({ key: 'page-title', value: pub.name })
      return pub
    },
    flow() {
      const flows = this.submitsStore.flows(this.pubid)
      if (!flows) return false
      const flow = _.find(flows, _flow => { return _flow.id === this.flowid })
      return flow
    },
    submit() {
      const submit = this.submitsStore.submit(this.pubid, this.submitid)
      return submit
    },
    showingadminoptions() {
      return this.formtype === 'showedit' || this.formtype === 'addsubmit'
    },
    entry() { // Called every time for all user input changes
      if (this.stageid) {
        console.log('###GET ENTRY VIA STAGEID')
        const entry = this.submitsStore.stagefields(this.stageid)
        if (!entry) return false

        const flow = this.flow
        if (!flow) return false
        entry.stage = _.find(flow.stages, stage => { return stage.id === this.stageid })

        //console.log(entry)
        //console.log("entry.fields", entry.fields)
        return entry
      }
      if (this.entryid) {
        console.log('###GET ENTRY VIA ENTRYID', this.pubid, this.entryid)
        const flows = this.submitsStore.flows(this.pubid)
        if (!flows) return false

        const entry = this.submitsStore.entry(this.entryid)
        if (!entry) return false

        const flow = _.find(flows, _flow => { return _flow.id === this.flowid })
        if (!flow) return false

        entry.stage = _.find(flow.stages, stage => { return stage.id === entry.flowstageId })

        //console.log("entry.fields",entry.fields)
        //console.log("entry.values",entry.values)
        for (const field of entry.fields) {
          const val = _.find(entry.values, value => {
            //console.log("compare",value.formfieldId, field.id)
            return value.formfieldId === field.id
          })
          field.val = val || {}
          field.val.newfile = null
          //console.log("field.val", field.val)
        }
        return entry
      }
    },
    showSubmitToggle() {
      return !this.$store.getters['misc/get']('entry-submit-toggle')
    },
    sectionheading() {
      const stagename = this.entry.stage.name
      const isadd = this.formtype == 'addsubmit' || 'addstage'
      console.log("sectionheading", stagename, isadd, this.formtype)
      return (this.editable ? (isadd ? 'Add ' : 'Edit ') : '') + stagename
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
          console.log("Field", fv)
          if (field.val.newfile) { // View filename
            console.log("NEWFILE", field.val.newfile) // console.log("NEWFILE",field.val.newfile.name)
            field.val.file = field.val.newfile.name // field.val.file = field.val.newfile.name
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
            case 'rolelookups':
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
              got = fv.existingfile != null || fv.file !== null
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
              const matches = tocheckmax.match(/\S+/g)
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
          const data = await api.submit.addSubmitEntry(entry, this.flowid)
          console.log('RECEIVED', data)
          const entryid = data.rv.id
          this.submitstatus = ''
          if (entryid) {
            this.editable = false
            this.miscStore.set({ key: 'message', value: 'Submitted OK. You should receive a confirmation email.' })
            // OK: redirect so new entry displayed properly
            navigateTo('/panel/' + this.pubid + '/' + this.flowid + '/' + data.rv.submitid + '/' + entryid)
          } else {
            this.error = 'Save error'
          }
        } else if (this.entryid) {  // EDIT ENTRY
          const returnedid = await api.submit.editEntry(entry)
          this.submitstatus = ''
          if (returnedid) {
            this.editable = false
            this.message = 'Updated OK'
            await this.submitsStore.fetchentry(this.entryid) // To get file relpath anew
          } else {
            this.error = 'Save error'
            this.submiterror = 'Save error'
          }
        } else { // ADD ENTRY
          console.log("ADD ENTRY")
          const data = await api.submit.addEntry(entry)
          const entryid = data.rv.id
          this.submitstatus = ''
          if (entryid) {
            this.editable = false
            this.miscStore.set({ key: 'message', value: 'Submitted OK. You should receive a confirmation email.' })
            // OK: redirect so new entry displayed properly
            navigateTo('/panel/' + this.pubid + '/' + this.flowid + '/' + this.submitid + '/' + entryid)
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
    changedFile(evt, field) {
      console.log("EntryForm.Changed", evt, field)
      if ('name' in evt) {
        console.log("EntryForm.Changed SAVED", evt)
        field.message = ''
        field.val.newfile = evt
        this.validationsummary = ''
      }
    },
    changed(field) {
      console.log("EntryForm.Changed", field)
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
    deleteEntry(entry) {
      this.error = ''
      this.showConfirm(entry.stage.name, 'Are you sure you want to delete this entry?', this.confirmDeleteEntry)
    },
    async confirmDeleteEntry() {
      try {
        const deleted = await api.submit.deleteEntry(this.entryid)
        if (!deleted) {
          this.error = 'Could not delete this entry'
          return
        }
        this.showConfirm('Entry deleted', 'Note: no statuses removed', this.doneDeleteEntry, 'OK', '')
      } catch (e) {
        this.error = e.message
      }
    },
    doneDeleteEntry() {
      navigateTo('/panel/' + this.pubid + '/' + this.flowid + '/' + this.submitid)
    }
  },
}
</script>
<style>
.status {
  font-weight: bold;
  color: green;
}
</style>
