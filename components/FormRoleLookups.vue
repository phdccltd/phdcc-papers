<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3">
      <div class="form-help">{{help}}</div>
      <b-form-select :id="sid"
                     v-model="arrayvalues"
                     :options="options"
                     multiple
                     :select-size="4">
      </b-form-select>
      <div class="alert-warning">{{message}}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{label}}
      </b-col>
      <b-col sm="8" class="formfieldview">
        {{plainvalues}}
      </b-col>
      <b-col sm="1" class="formfieldview text-right">
        <span v-if="help" v-b-tooltip.hover.left :title="help">
          <v-icon name="info-circle" scale="1" />
        </span>
      </b-col>
    </b-row>
  </div>
</template>
<script>
  const _ = require('lodash/core')
  export default {
    data() {
      return {
      }
    },
    props: {
      edit: { type: Boolean },
      reqd: { type: Boolean },
      label: { type: String },
      sid: { type: String },
      help: { type: String },
      value: { type: String },
      pubroleId: { type: Number },
      message: { type: String },
    },
    computed: {
      labelreqd() {
        return this.reqd ? this.label + ' *' : this.label
      },
      arrayvalues: {
        get: function () {
          if (!this.value) return []
          //console.log('arrayvalues get')
          return this.value.split(',')
        },
        set: function (v) {
          //console.log('arrayvalues set', v.join(','))
          this.$emit('input', v.join(','))
        },
      },
      plainvalues() {
        if (!this.value) return ''
        const avalues = this.value.split(',')
        console.log(avalues)
        const atext = []
        console.log(this.options)
        for (const option of this.options) {
          for (const av of avalues) {
            if (option.value === parseInt(av)) {
              atext.push(option.text)
            }
          }
        }
        return atext.join(' | ')
      },
      options() {
        const pubid = parseInt(this.$route.params.pubid)
        console.log('FormRoleLookups pubid', pubid)
        const pub = this.$store.getters['pubs/getPub'](pubid)
        if (!pub) return []

        let entry = false
        if (this.$route.params.stageid) {
          const stageid = parseInt(this.$route.params.stageid)
          entry = this.$store.getters['submits/stagefields'](stageid)
        }
        if (this.$route.params.entryid) {
          const entryid = parseInt(this.$route.params.entryid)
          entry = this.$store.getters['submits/entry'](entryid)
        }
        if (!entry) return []

        console.log('FormRoleLookups this.pubroleId', this.pubroleId)
        const pubrolelookup = _.find(entry.pubrolelookups, pubrolelookup => { return pubrolelookup.pubroleId === this.pubroleId })
        if (!pubrolelookup) {
          console.log('FormRoleLookups NOPE')
          return []
        }
        return pubrolelookup.users
      }
    }
  }
</script>
<style>
</style>
