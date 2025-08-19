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
  
<script setup lang="ts">
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'

definePageMeta({
  middleware: ["authuser"]
})

const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const route = useRoute()

const error = ref('')
const message = ref('')

onMounted(async () => { // Client only
  error.value = ''
  message.value = ''
  //console.log('_id mounted', pubid.value)
  await pubsStore.clearError()
  await submitsStore.clearError()
  await pubsStore.fetch()
  await submitsStore.fetchpub(pubid.value)
})

const pubid = computed((): number => {
  return parseInt(route.params.pubid as string)
})

const pub = computed(() => {
  const pub = pubsStore.getPub(pubid.value)
  return pub ? pub : {}
})

const fatalerror = computed(() => {
  const error1 = pubsStore.error
  const error2 = submitsStore.error
  return error1 ? error2 ? error1 + ". " + error2 : error1 : error2
})

function setError(msg: string) {
  error.value = msg
}

function setMessage(msg: string) {
  message.value = msg
}
</script>
  