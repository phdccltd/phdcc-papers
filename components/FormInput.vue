<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3">
      <div class="form-help">
        <a v-if="helplink" :href="helplink" target="_blank">
          {{help}}
          <v-icon name="external-link-alt" scale="0.75" class="ml-1" />
        </a>
        <div v-else>{{help}}</div>
      </div>
      <b-form-input :id="sid"
                    :type="type"
                    v-bind:value="value"
                    v-on:input="$emit('input', $event)"
                    :placeholder="reqd?'Required':''">
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
        <span v-if="help" v-b-tooltip.hover.left :title="help" >
          <v-icon name="info-circle" scale="1"/>
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
