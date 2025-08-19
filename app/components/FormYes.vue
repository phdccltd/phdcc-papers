<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" label-cols-sm="3" :state="true">
      <div class="form-help">
        <a v-if="helplink" :href="helplink" target="_blank">
          {{ help }}
          <v-icon icon="external-link-alt" class="ms-1" />
        </a>
        <div v-else>{{ help }}</div>
      </div>
      <b-form-radio-group :id="sid" v-model="selection" :options="options">
      </b-form-radio-group>
      <div class="alert-warning">{{ message }}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{ label }}
      </b-col>
      <b-col sm="8" class="formfieldview">
        {{ yesno }}
      </b-col>
      <b-col sm="1" class="formfieldview text-end">
        <span v-if="help" :title="help">
          <v-icon icon="info-circle" />
        </span>
      </b-col>
    </b-row>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash/core'

const props = defineProps({
  edit: { type: Boolean },
  reqd: { type: Boolean },
  label: { type: String },
  sid: { type: String },
  help: { type: String },
  helplink: { type: String },
  modelValue: { type: Number },
  message: { type: String },
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const options = [
  { value: 1, text: 'Yes' },
]

const labelreqd = computed(() => {
  return props.reqd ? props.label + ' *' : props.label
})

const selection = computed({
  get: () => props.modelValue,
  set: (v: number) => emit('update:modelValue', v)
})

const yesno = computed(() => {
  const option = _.find(options, _option => _option.value === props.modelValue)
  if (option) return option.text
  return 'Unknown'
})
</script>
