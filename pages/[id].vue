<template>
  <div>
    <!-- MOSTLY DONE -->
    <div v-html="content">
    </div>
  </div>
</template>
  
<script lang="ts">
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages";

export default {

  setup() {
    const miscStore = useMiscStore()
    const sitePagesStore = useSitePagesStore()
    return { miscStore, sitePagesStore }
  },
  async mounted() { // Client only
    this.sitePagesStore.fetch() // Do not await as knackers useVueRecaptcha. WHY? TODO
  },

  computed: {
    content() {
      const route = useRoute()
      const path = '/' + route.params.id
      // console.log('_id content path', path)
      const sitepage: { content: string } = this.sitePagesStore.get(path)
      if (sitepage) {
        this.miscStore.set({ key: 'page-title', value: sitepage.title })
      }
      return sitepage ? sitepage.content : '';
    }
  },
}
</script>
  