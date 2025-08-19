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
      <b-form-select :id="sid" v-model="arrayvalues" :options="options" multiple :select-size="4" :data-cy="'formlookups-' + sid">
      </b-form-select>
      <div class="alert-warning">{{ message }}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{ label }}
      </b-col>
      <b-col sm="8" class="formfieldview" :data-cy="'formlookups-value-' + sid">
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
  modelValue: { type: String },
  publookupId: { type: Number },
  message: { type: String },
})

interface Emits {
  (e: 'update:modelValue', value: string | null): void
}

const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()

const labelreqd = computed(() => {
  return props.reqd ? props.label + ' *' : props.label
})

const arrayvalues = computed({
  get: () => {
    if (!props.modelValue) return []
    return props.modelValue.split(',')
  },
  set: (v: string[]) => {
    emit('update:modelValue', v.length == 0 ? null : v.join(','))
  },
})

const plainvalues = computed(() => {
  if (!props.modelValue) return ''
  const avalues = props.modelValue.split(',')
  const atext = []
  for (const option of options.value) {
    for (const av of avalues) {
      if (option.id === parseInt(av)) {
        atext.push(option.text)
      }
    }
  }
  return atext.join(' | ')
})

const options = computed(() => {
  const route = useRoute()
  const pubid = parseInt(route.params.pubid as string)
  const pub = pubsStore.getPub(pubid)
  if (!pub) return []

  const publookup = _.find(pub.publookups, _publookup => { return _publookup.id === props.publookupId })
  if (!publookup) return []
  if (publookup && publookup.values) {
    publookup.values.forEach(v => {
      v.value = v.id.toString()
    })
  }
  return publookup.values
})
</script>
