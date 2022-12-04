<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3">
      <div class="form-help">
        <a v-if="helplink" :href="helplink" target="_blank">
          {{ help }}
          <v-icon icon="external-link-alt" class="ms-1" />
        </a>
        <div v-else>{{ help }}</div>
      </div>
      <b-form-input :id="sid" :type="type" v-bind:value="value" v-on:input="$emit('input', $event)" :placeholder="reqd ? 'Required' : ''">
      </b-form-input>
      <div class="alert-warning">{{ message }}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{ label }}
      </b-col>
      <b-col sm="8" class="formfieldview">
        {{ value }}
      </b-col>
      <b-col sm="1" class="formfieldview text-end">
        <span v-if="help" :title="help">
          <v-icon icon="info-circle" />
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
    type: { type: String },
    reqd: { type: Boolean },
    label: { type: String },
    sid: { type: String },
    help: { type: String },
    helplink: { type: String },
    value: { type: String },
    message: { type: String },
  },
  computed: {
    labelreqd() {
      return this.reqd ? this.label + ' *' : this.label
    },
  }
}
</script>
