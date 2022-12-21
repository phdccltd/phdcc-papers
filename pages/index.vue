<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
  </div>
</template>

<script lang="ts">
import { useMiscStore } from "~/stores/misc"
import { useSitePagesStore } from "~/stores/sitepages"

export default {
  inject: { setLayoutMessage: {} },
  data() {
    return {
      error: '',
      message: '',
    }
  },

  setup() {
    // const runtimeConfig = useRuntimeConfig()
    // console.log('INDEX.VUE', runtimeConfig.public.API) // public is on server and in client
    // const appConfig = useAppConfig()
    // console.log("INDEX.VUE",appConfig.testing) // on server and in client

    const sitePagesStore = useSitePagesStore()
    const miscStore = useMiscStore()

    return { miscStore, sitePagesStore }
  },

  mounted() { // Client only
    this.setLayoutMessage()
    this.sitePagesStore.fetch()
  },
  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/')
      if (sitepage) {
        this.miscStore.set({ key: 'page-title', value: sitepage.title })
      }
      return sitepage ? sitepage.content : ''
    },
  },
}
</script>
