<template>
  <div>
    <h1>Welcome to the homepage</h1>
    <AppAlert> This is an auto-imported component in AppAlert </AppAlert>
    <BlogPost :blog="bloggy"/>
  </div>
</template>

<script lang="ts">
definePageMeta({
  middleware: 'auth',
})

import BlogPost from '../components/BlogPost.vue';
import { useMiscStore } from "~/stores/misc";

export default {
  setup() {
    const runtimeConfig = useRuntimeConfig()
    console.log('INDEX.VUE', runtimeConfig.public.api) // public is on server and in client
    // const appConfig = useAppConfig()
    // console.log("INDEX.VUE",appConfig.testing) // on server and in client

    const miscStore = useMiscStore()
    miscStore.set({
            key: 'hideglobalwarning',
            value: false,
          })
          miscStore.set({
            key: 'bloggy',
            value: 'datbloggy',
          })
    return { miscStore }
  },
  computed: {
    bloggy(){
      return this.miscStore.get('bloggy')
    },
    globalwarning() {
      return this.miscStore.get('hideglobalwarning')
    }
  },
}
</script>
