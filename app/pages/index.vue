<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content" data-cy="index-sitepages-content">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMiscStore } from "~/stores/misc"
import { useSitePagesStore } from "~/stores/sitepages"

const error = ref('')
const message = ref('')

const sitePagesStore = useSitePagesStore()
const miscStore = useMiscStore()

const content = computed(() => {
  const sitepage = sitePagesStore.get('/')
  if (sitepage) {
    miscStore.set({ key: 'page-title', value: sitepage.title })
  }
  return sitepage ? sitepage.content : ''
})

onMounted(() => {
  sitePagesStore.fetch()
})
</script>
