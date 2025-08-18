<template>
  <div>
    <!-- MAIN PANEL SHOWING ALL PUBLICATIONS -->
    <HelpHome />
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else>
      <Messages :error="error" :message="message" />
      <h2>{{ subtitle }}</h2>
      <b-container v-for="(pub, index) in pubs" :key="index" class="mt-2 ps-0">
        <b-row no-gutters :class="'p-2 ' + (pub.owner ? 'pub-owner' : (pub.notowner ? 'pub-notowner' : (issuper ? 'pub-super' : 'pub-weird')))">
          <b-col sm="3">
            <b-button variant="outline-primary" :to="'/panel/' + pub.id" :data-cy="'panel-pub-' + pub.id">
              {{ pub.name }}
            </b-button>
          </b-col>
          <b-col sm="9">
            <b-badge v-if="!pub.enabled" pill variant="danger">DISABLED FOR USERS</b-badge>
            <br v-if="!pub.enabled" />
            {{ pub.description }}
          </b-col>
        </b-row>
      </b-container>
      <div v-if="nowtavailable">
        Nothing available
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSitePagesStore } from "~/stores/sitepages"
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'

definePageMeta({
  middleware: 'authuser',
})

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const sitePagesStore = useSitePagesStore()
const runtimeConfig = useRuntimeConfig()
const grecaptcha = ref(runtimeConfig.public.RECAPTCHA_BYPASS)

const error = ref('')
const subtitle = ref('')

const message = computed(() => {
  return 'Hello ' + authStore.username
})

const fatalerror = computed(() => {
  return pubsStore.error
})

const issuper = computed(() => {
  return authStore.super
})

const pubs = computed(() => {
  const pubs = pubsStore.pubs

  // Set apiversion here
  for (const pub in pubs) {
    miscStore.set({ key: 'apiversion', value: pubs[pub].apiversion })
    break
  }

  return pubs
})

const nowtavailable = computed(() => {
  const pubs = pubsStore.pubs
  let count = 0
  for (const pub in pubs) { count++ }
  return count === 0
})

onMounted(async () => {
  let title = 'Publications'
  if ('publicsettings' in authStore && 'pubscalled' in authStore.publicsettings) {
    title = authStore.publicsettings.pubscalled
    subtitle.value = 'Your ' + title.toLowerCase()
  }
  miscStore.set({ key: 'page-title', value: title })
  await pubsStore.clearError()
  await pubsStore.fetch()
})
</script>  