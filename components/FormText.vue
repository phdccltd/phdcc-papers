<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3" state="true">
      <div class="form-help">
        <a v-if="helplink" :href="helplink" target="_blank">
          {{ help }}
          <v-icon icon="external-link-alt" class="ms-1" />
        </a>
        <div v-else>{{ help }}</div>
      </div>
      <b-form-textarea :id="sid" max-rows="100" v-model="modelValue2" class="font-weight-bold" style="overflow-y: auto;"
        :placeholder="reqd ? 'Required' : ''" :data-cy="'formtext-' + sid" @update="update">
      </b-form-textarea>
      <div class="alert-warning">{{ message }}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{ label }}
      </b-col>
      <b-col sm="8" class="formfieldview" :data-cy="'formtext-value' + sid">
        <p v-for="para in modelValueParas" class="pre-textarea">{{ para }}</p>
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
      modelValue2: ''
    }
  },
  props: {
    edit: { type: Boolean },
    reqd: { type: Boolean },
    label: { type: String },
    sid: { type: String },
    help: { type: String },
    helplink: { type: String },
    modelValue: { type: String },
    message: { type: String },
  },
  mounted() {
    this.modelValue2 = this.modelValue
  },
  computed: {
    labelreqd() {
      return this.reqd ? this.label + ' *' : this.label
    },
    modelValueParas() {
      if (this.modelValue == null) return []
      return this.modelValue.split('\n')
    },
    update(event) {
      this.$emit('update:modelValue', this.modelValue2)
    }
  }
}
</script>
