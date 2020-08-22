<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3">
      {{existingfile}}
      <div class="form-help">{{help}}</div>
      <b-form-file :id="sid"
                   v-bind:value="value"
                   v-on:input="$emit('input', $event)"
                   :accept="allowedfiletypes"
                   :placeholder="reqd?'Required. ':''">
      </b-form-file>
      <div class="alert-warning">{{message}}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{label}}
      </b-col>
      <b-col sm="8" class="formfieldview">
        <a href='#' v-if="existingfile" @click.prevent="downloadItem()">
          {{existingfilename}}
        </a>
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
  const path = require('path')
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
      allowedfiletypes: { type: String },
      existingfile: { type: String },
      relpath: { type: String },
      value: { type: File },
      message: { type: String },
    },
    mounted() {
    },
    computed: {
      labelreqd() {
        return this.reqd ? this.label + ' *' : this.label
      },
      existingfilename() {
        return path.basename(this.existingfile)
      },
    },
    methods: {
      async downloadItem() {
        //console.log('downloadItem', this.relpath)
        const ret = await this.$api.submit.getFile(this.relpath)
        const blob = new Blob([ret.data], { type: ret.data.type })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = path.basename(this.existingfile)
        link.click()
        URL.revokeObjectURL(link.href)
      }
    }
  }
</script>
<style>
</style>
