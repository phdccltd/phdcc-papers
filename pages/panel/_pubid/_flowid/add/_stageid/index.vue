<template>
  <!-- ADD NEW SUBMIT -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else>
      <HelpAdd />
      <Messages :error="error" :message="message" />
      <h2 class="not-bg-yellow">
        {{ flow.name }}
      </h2>
      <div v-if="entry">
        <h2 class="border border-primary rounded bg-yellow mt-2 p-2">
          Add {{ entry.stage.name }}
        </h2>
        <b-form @submit="onSubmit" :xvalidated="true" @submit.stop.prevent>
          <FormInput v-bind:reqd="true" type="text" v-bind:edit="true" label="Title" sid="field0" help="" class="mt-2 pl-0 container" />
          <b-container v-for="(field, index) in entry.fields" :key="index" class="mt-2 pl-0">
            <FormInput v-if="field.type=='email'" type="email" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                       v-bind:reqd="field.required"
                       v-model="field.val.string" />
            <FormFile v-if="field.type.substring(0,4)=='file'" :edit="editable" :label="field.label" :sid="'field'+field.id" :help="field.help"
                      v-bind:reqd="field.required"
                      :existingfile="field.val.file"
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
            <!--ADD NEW SUBMIT: {{field.val.string}} {{field.val.integer}}-->
            <span v-if="field.val.newfile">
              {{field.val.newfile.name}}
            </span>
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
  import HelpAdd from '~/components/HelpAdd'
  import Messages from '~/components/Messages'
  import FormFile from '~/components/FormFile'
  import FormInput from '~/components/FormInput'
  import FormLookup from '~/components/FormLookup'
  import FormLookups from '~/components/FormLookups'
  import FormText from '~/components/FormText'
  import FormYesNo from '~/components/FormYesNo'
  import { page } from '@/utils/phdcc'

  page.title = 'ADD NEW SUBMIT'

  export default {
    middleware: 'authuser',
    components: { HelpAdd, Messages, FormFile, FormInput, FormLookup, FormLookups, FormText, FormYesNo },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: '',
        editable: true,
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
      entry() {
        const entry = this.$store.getters['submits/stagefields'](this.stageid)
        if (!entry) {
          console.log("NO ENTRY")
          return false
        }
        console.log("GOT ENTRY")

        const flow = this.flow
        if (flow) {
          entry.stage = _.find(flow.stages, stage => { return stage.id === this.stageid })
        }

        //console.log(entry)
        console.log("RETURNING ENTRY")
        return entry
      }
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
