<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3">
      <div class="form-help">{{help}}</div>
      <b-form-textarea :id="sid"
                       v-bind:value="value"
                       v-on:input="$emit('input', $event)"
                       max-rows="100"
                       class="font-weight-bold"
                       style="overflow-y: auto;"
                       :placeholder="reqd?'Required':''">
      </b-form-textarea>
      <div class="alert-warning">{{message}}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{label}}
      </b-col>
      <b-col sm="8" class="formfieldview">
        <b-form-textarea :id="sid" plaintext :value="value" max-rows="100" class="font-weight-bold" style="overflow-y: auto;"></b-form-textarea>
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
      message: { type: String },
    },
    mounted() {
    },
    computed: {
      labelreqd() {
        return this.reqd ? this.label + ' *' : this.label
      },
    }
  }
</script>
<style>
</style>
