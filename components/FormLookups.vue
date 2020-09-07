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
      publookupId: { type: Number },
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
        //console.log(avalues)
        const atext = []
        for (const option of this.options) {
          for (const av of avalues) {
            if (option.id === parseInt(av)) {
              atext.push(option.text)
            }
          }
        }
        return atext.join(' | ')
      },
      options() {
        const pubid = parseInt(this.$route.params.pubid)
        const pub = this.$store.getters['pubs/getPub'](pubid)
        if (!pub) return []
        const publookup = _.find(pub.publookups, publookup => { return publookup.id === this.publookupId })
        //console.log('publookup', publookup)
        if (publookup && publookup.values) {
          publookup.values.forEach(v => {
            v.value = v.id
          })
        }
        return publookup.values
      }
    }
  }
</script>
<style>
</style>
