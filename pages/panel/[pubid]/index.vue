<template>
  <div>
    <!-- OVERVIEW PANEL FOR ONE PUBLICATION -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else>
      <HelpPanel :custom="pub.description" />
      <Messages :error="error" :message="message" />
      <div v-for="pubrolemessage in pub.pubrolemessages">
        <PubRoleMessage :message="pubrolemessage"/>
      </div>
      <PublicationSubmissions :setError="setError" :setMessage="setMessage" />
    </div>
  </div>
</template>
  
<script lang="ts">
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'

export default {
  setup() {
    definePageMeta({
      middleware: ["authuser"]
    })
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()

    return { miscStore, pubsStore, submitsStore }
  },
  data() {
    return {
      error: '',
      message: '',
    }
  },
  async mounted() { // Client only
    this.error = ''
    this.message = ''
    //console.log('_id mounted', this.pubid)
    await this.pubsStore.clearError()
    await this.submitsStore.clearError()
    await this.pubsStore.fetch()
    await this.submitsStore.fetchpub(this.pubid)
  },
  computed: {
    pubid(): number {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    pub() {
      const pub = this.pubsStore.getPub(this.pubid)
      return pub ? pub : {}
    },
    fatalerror() {
      const error1 = this.pubsStore.error
      const error2 = this.submitsStore.error
      return error1 ? error2 ? error1 + ". " + error2 : error1 : error2
    },
  },
  methods: {
    setError(msg) {
      this.error = msg
    },
    setMessage(msg) {
      this.message = msg
    },
  },
}
</script>
  