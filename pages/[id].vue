<template>
  <div>
    <div v-html="content">
    </div>
  </div>
</template>
  
<script lang="ts">
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages"

export default {

  setup() {
    const miscStore = useMiscStore()
    const sitePagesStore = useSitePagesStore()
    return { miscStore, sitePagesStore }
  },
  async mounted() { // Client only
    await this.sitePagesStore.fetch()
  },

  computed: {
    content() {
      const route = useRoute()
      const path = '/' + route.params.id
      const sitepage: { content: string } = this.sitePagesStore.get(path)
      if (sitepage) {
        this.miscStore.set({ key: 'page-title', value: sitepage.title })
      }
      return sitepage ? sitepage.content : ''
    }
  },
}
</script>
  