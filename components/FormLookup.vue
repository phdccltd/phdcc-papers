<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3">
      <div class="form-help">{{help}}</div>
      <b-form-select :id="sid"
                     v-model="arrayvalues"
                     :options="options"
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
      value: { type: Number },
      publookupId: { type: Number },
      message: { type: String },
    },
    mounted() {
    },
    computed: {
      labelreqd() {
        return this.reqd ? this.label + ' *' : this.label
      },
      arrayvalues: {
        get: function () {
          //if (!this.value) return [] OK as null
          //console.log('arrayvalues get',this.value)
          return this.value
        },
        set: function (v) {
          //console.log('arrayvalues set', v)
          this.$emit('input', v)
        },
      },
      plainvalues() {
        if (!this.value) return ''
        //console.log('plainvalues',this.value)
        const atext = []
        for (const option of this.options) {
          if (option.id === this.value) {
            atext.push(option.text)
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
