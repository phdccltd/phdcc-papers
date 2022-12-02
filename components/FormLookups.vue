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
        <span v-if="help" v-b-tooltip.hover.left :title="help">
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
    value: { type: String },
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
        if (!this.value) return []
        //console.log('arrayvalues get')
        return this.value.split(',')
      },
      set: function (v) {
        //console.log('arrayvalues set', v.join(','))
        this.$emit('input', v.length == 0 ? null : v.join(','))
      },
    },
    plainvalues() {
      if (!this.value) return ''
      const avalues = this.value.split(',')
      //console.log(avalues)
      const atext = []
      for (const option of this.options) {
        for (const av of avalues) {
          if (option.id === parseInt(av)) {
            atext.push(option.text)
          }
        }
      }
      return atext.join(' | ')
    },
    options() {
      const route = useRoute()
      const pubid = parseInt(route.params.pubid)
      const pub = this.pubsStore.getPub(this.pubid)
      if (!pub) return []

      const publookup = _.find(pub.publookups, _publookup => { return _publookup.id === this.publookupId })
      if (!publookup) return []
      //console.log('publookup', publookup)
      if (publookup && publookup.values) {
        publookup.values.forEach(v => {
          v.value = v.id
        })
      }
      return publookup.values
    }
  }
}
</script>
