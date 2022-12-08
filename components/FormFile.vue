<template>
  <div>
    <!-- Uses our own BFormFile as this not in bootstrap-vue-3 yet -->
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3">
      <div class="form-help">
        <a v-if="helplink" :href="helplink" target="_blank">
          {{ help }}
          <v-icon icon="external-link-alt" class="ms-1" />
        </a>
        <div v-else>{{ help }}</div>
      </div>
      <BFormFile :id="sid" @input="onInput($event)" :accept="allowedfiletypes" :placeholder="placeholder">
      </BFormFile>
      <div class="alert-warning">{{ message }}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{ label }}
      </b-col>
      <b-col sm="8" class="formfieldview">
        <a href='#' v-if="existingfile" @click.prevent="downloadItem()">
          {{ filename }}
        </a><br />
        <div class="alert-warning">{{ downloaderror }}</div>
      </b-col>
      <b-col sm="1" class="formfieldview text-end">
        <span v-if="help" :title="help">
          <v-icon icon="info-circle" />
        </span>
      </b-col>
    </b-row>
  </div>
</template>
<script lang="ts">
import api from '~/api'

export default {
  data() {
    return {
      newfilename: null,
      downloaderror: ''
    }
  },
  props: {
    edit: { type: Boolean },
    reqd: { type: Boolean },
    label: { type: String },
    sid: { type: String },
    help: { type: String },
    helplink: { type: String },
    allowedfiletypes: { type: String },
    existingfile: { type: String },
    relpath: { type: String },
    //modelValue: { type: File }, // field.val.newfile
    message: { type: String },
  },
  computed: {
    labelreqd() {
      return this.reqd ? this.label + ' *' : this.label
    },
    filename() {
      return this.basename(this.newfilename ? this.newfilename : this.existingfile)
    },
    placeholder(){
      const ph = this.filename
      if( ph.length>0) return ph
      return this.reqd ? 'Required' : ''
    },
  },
  methods: {
    basename(thepath?: string) {
      if (thepath == null) return ''
      const lastslash = thepath.lastIndexOf('/')
      return lastslash === -1 ? thepath : thepath.substring(lastslash + 1)
    },
    async downloadItem() {
      //console.log('downloadItem', this.relpath)
      this.downloaderror = ''
      const ret = await api.submit.getFile(this.relpath)
      const blob = new Blob([ret.data], { type: ret.data.type })
      if (ret.data.type === 'application/json') { // Error eg {ret: 1, status: "Sorry: file not available /1/2/1/20/92/file.docx"}
        this.downloaderror = 'Download error'
        const reader = new FileReader()
        reader.addEventListener('loadend', (e) => {
          const data = JSON.parse(e.srcElement.result)
          this.downloaderror = data.status
        })
        reader.readAsText(blob)
        return
      }
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = this.basename(this.existingfile)
      link.click()
      URL.revokeObjectURL(link.href)
    },
    onInput(file: File) {
      if ('name' in file) {
        this.newfilename = file.name
        this.$emit('input', file)
      }
    }
  }
}
</script>
