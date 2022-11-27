<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    HELLO INDEX
  </div>
</template>

<script lang="ts">
import { buildHead } from '~/composables/useBuildHead'
import Messages from '~/components/Messages.vue';
import { useMiscStore } from "~/stores/misc";
import { useSitePagesStore } from "~/stores/sitepages";

export default {
  data() {
    return {
      error: '',
      message: ''
    }
  },

  setup() {
    const runtimeConfig = useRuntimeConfig()
    console.log('INDEX.VUE', runtimeConfig.public.API) // public is on server and in client
    // const appConfig = useAppConfig()
    // console.log("INDEX.VUE",appConfig.testing) // on server and in client

    const sitePagesStore = useSitePagesStore()
    const miscStore = useMiscStore()
    /*miscStore.set({
            key: 'hideglobalwarning',
            value: false,
          })
          miscStore.set({
            key: 'bloggy',
            value: 'datbloggy',
          })*/
    
    useHead(
      buildHead(
        'Conferences',
        "Welcome to Papers"
      )
    )
    return { miscStore, sitePagesStore }
  },

  mounted() { // Client only
    //console.log('+++++ index MOUNTED')
    this.sitePagesStore.fetch()
    //this.$store.dispatch('sitepages/fetch')
    //this.$store.commit("page/setTitle", page.title)
  },
  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/')
        if (sitepage) {
          //page.title = sitepage.title
          return sitepage.content
        }
        return ''
            },
    /*bloggy(){
      return this.miscStore.get('bloggy')
    },
    globalwarning() {
      return this.miscStore.get('hideglobalwarning')
    }*/
  },
}
</script>
