<template>
  <div>
    <div v-html="content" data-cy="id-sitepages-content">
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from '~/stores/sitepages'

const route = useRoute()
const miscStore = useMiscStore()
const sitePagesStore = useSitePagesStore()

onMounted(async () => {
  await sitePagesStore.fetch()
})

const content = computed(() => {
  const path = '/' + route.params.id
  const sitepage: { content: string, title?: string } = sitePagesStore.get(path)
  if (sitepage && sitepage.title) {
    miscStore.set({ key: 'page-title', value: sitepage.title })
  }
  return sitepage ? sitepage.content : ''
})
</script>