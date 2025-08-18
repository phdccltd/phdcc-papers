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
      <b-form-select :id="sid" v-model="arrayvalues" :options="options" :select-size="4" :data-cy="'formlookup-'+sid">
      </b-form-select>
      <div class="alert-warning">{{ message }}</div>
    </b-form-group>
    <b-row v-else no-gutters>
      <b-col sm="3">
        {{ label }}
      </b-col>
      <b-col sm="8" class="formfieldview" :data-cy="'formlookup-value-'+sid">
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

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import _ from 'lodash/core'

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
    helplink: { type: String },
    modelValue: { type: Number },
    publookupId: { type: Number },
    message: { type: String },
  },
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()

    return { authStore, miscStore, pubsStore, submitsStore }
  },
  computed: {
    labelreqd() {
      return this.reqd ? this.label + ' *' : this.label
    },
    arrayvalues: {
      get: function () {
        return this.modelValue
      },
      set: function (v) {
        this.$emit('update:modelValue', v)
      },
    },
    plainvalues() {
      if (!this.modelValue) return ''
      const atext = []
      for (const option of this.options) {
        if (option.id === this.modelValue) {
          atext.push(option.text)
        }
      }
      return atext.join(' | ')
    },
    options() {
      const route = useRoute()
      const pubid = parseInt(route.params.pubid)
      const pub = this.pubsStore.getPub(pubid)
      if (!pub) return []
      const publookup = _.find(pub.publookups, _publookup => { return _publookup.id === this.publookupId })
      if (publookup && publookup.values) {
        publookup.values.forEach(v => {
          v.value = v.id.toString()
        })
      }
      return publookup.values
    }
  }
}
</script>
