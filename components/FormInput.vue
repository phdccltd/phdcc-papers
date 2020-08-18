<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3"
                  :description="help">
      <b-form-input :id="sid"
                    :type="type"
                    v-bind:value="value"
                    v-on:input="$emit('input', $event)"
                    :required="reqd">
      </b-form-input>
      <div class="alert-warning">{{message}}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{label}}
      </b-col>
      <b-col sm="8" class="formfieldview">
        {{value}}
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
  export default {
    data() {
      return {
      }
    },
    props: {
      edit: { type: Boolean },
      type: { type: String },
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
