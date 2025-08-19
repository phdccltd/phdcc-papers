<template>
  <div>
    <b-form-group v-if="edit" :label="labelreqd" :label-for="sid" label-cols-sm="3" :state="true">
      <div class="form-help">
        <a v-if="helplink" :href="helplink" target="_blank">
          {{ help }}
          <v-icon icon="external-link-alt" class="ms-1" />
        </a>
        <div v-else>{{ help }}</div>
      </div>
      <b-form-select :id="sid" v-model="arrayvalues" :options="options" :select-size="4" :data-cy="'formlookup-' + sid">
      </b-form-select>
      <div class="alert-warning">{{ message }}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{ label }}
      </b-col>
      <b-col sm="8" class="formfieldview" :data-cy="'formlookup-value-' + sid">
        {{ plainvalues }}
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
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import _ from 'lodash/core'

const props = defineProps({
  edit: { type: Boolean },
  reqd: { type: Boolean },
  label: { type: String },
  sid: { type: String },
  help: { type: String },
  helplink: { type: String },
  modelValue: { type: Number },
  publookupId: { type: Number },
  message: { type: String },
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const route = useRoute()

const labelreqd = computed(() => {
  return props.reqd ? props.label + ' *' : props.label
})

const arrayvalues = computed({
  get: () => props.modelValue,
  set: (v: number) => emit('update:modelValue', v)
})

const options = computed(() => {
  const pubid = parseInt(route.params.pubid as string)
  const pub = pubsStore.getPub(pubid)
  if (!pub) return []
  const publookup = _.find(pub.publookups, _publookup => _publookup.id === props.publookupId)
  if (publookup && publookup.values) {
    publookup.values.forEach(v => {
      v.value = v.id.toString()
    })
  }
  return publookup.values
})

const plainvalues = computed(() => {
  if (!props.modelValue) return ''
  const atext = []
  for (const option of options.value) {
    if (option.id === props.modelValue) {
      atext.push(option.text)
    }
  }
  return atext.join(' | ')
})
</script>
