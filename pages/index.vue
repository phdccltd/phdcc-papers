<template>
  <div>
    <h1>Welcome to the homepage</h1>
    <Messages :error="error" :message="message" />
  </div>
</template>

<script lang="ts">
definePageMeta({
  middleware: 'auth',
})

import Messages from '../components/Messages.vue';
import { useMiscStore } from "~/stores/misc";

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

    const miscStore = useMiscStore()
    /*miscStore.set({
            key: 'hideglobalwarning',
            value: false,
          })
          miscStore.set({
            key: 'bloggy',
            value: 'datbloggy',
          })*/
    return { miscStore }
  },
  computed: {
    /*bloggy(){
      return this.miscStore.get('bloggy')
    },
    globalwarning() {
      return this.miscStore.get('hideglobalwarning')
    }*/
  },
}
</script>
