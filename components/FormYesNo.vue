<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" label-cols-sm="3">
      {{help}}
      <b-form-radio-group :id="sid"
                          v-model="selection"
                          :options="options"
                          :required="reqd">
      </b-form-radio-group>
      <div class="alert-warning">{{message}}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{label}}
      </b-col>
      <b-col sm="8" class="formfieldview">
        {{yesno}}
      </b-col>
      <b-col sm="1" class="formfieldview text-right">
        <abbr v-if="help" :title="help">
          <v-icon name="info-circle" scale="1" />
        </abbr>
      </b-col>
    </b-row>
  </div>
</template>
<script>
  const _ = require('lodash/core')
  export default {
    data() {
      return {
        options: [
          { value: 0, text: 'No' },
          { value: 1, text: 'Yes' },
        ],
      }
    },
    props: {
      edit: { type: Boolean },
      reqd: { type: Boolean },
      label: { type: String },
      sid: { type: String },
      help: { type: String },
      value: { type: Number },
      message: { type: String },
    },
    mounted() {
    },
    computed: {
      labelreqd() {
        return this.reqd ? this.label + ' *' : this.label
      },
      selection: {
        get: function () {
          return this.value
        },
        set: function (v) {
          this.$emit('input', v)
        },
      },
      yesno() {
        const option = _.find(this.options, option => { return option.value === this.value })
        if (option) return option.text
        return 'Unknown'
      }
    }
  }
</script>
<style>
</style>
