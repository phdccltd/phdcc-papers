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
      <b-form-select :id="sid" v-model="arrayvalues" :options="options" multiple :select-size="4">
      </b-form-select>
      <div class="alert-warning">{{ message }}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{ label }}
      </b-col>
      <b-col sm="8" class="formfieldview">
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
  value: { type: String },
  pubroleId: { type: Number },
  message: { type: String },
})

interface Emits {
  (e: 'input', value: string | null): void
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
    //console.log('arrayvalues get')
    if (!props.value) return []
    return props.value.split(',')
  },
  set: (v: string[]) => {
    //console.log('arrayvalues set', v.join(','))
    emit('input', v.length == 0 ? null : v.join(','))
  },
})

const plainvalues = computed(() => {
  if (!props.value) return ''
  const avalues = props.value.split(',')
  console.log(avalues)
  const atext = []
  console.log(options.value)
  for (const option of options.value) {
    for (const av of avalues) {
      if (option.value === parseInt(av)) {
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

  let entry: any = false
  if (route.params.stageid) {
    const stageid = parseInt(route.params.stageid as string)
    entry = submitsStore.stagefields(stageid)
  }
  if (route.params.entryid) {
    const entryid = parseInt(route.params.entryid as string)
    entry = submitsStore.entry(entryid)
  }
  if (!entry) return []

  console.log('FormRoleLookups this.pubroleId', props.pubroleId)
  const pubrolelookup = _.find(entry.pubrolelookups, _pubrolelookup => { return _pubrolelookup.pubroleId === props.pubroleId })
  if (!pubrolelookup) {
    console.log('FormRoleLookups NOPE')
    return []
  }
  return pubrolelookup.users
})
</script>
