<template>
  <div>
    <h1>Welcome to the homepage</h1>
    <AppAlert> This is an auto-imported component in AppAlert </AppAlert>
    <BlogPost :blog="test.vs"/>
  </div>
</template>

<script lang="ts">
definePageMeta({
  middleware: 'auth',
})

import BlogPost from '../components/BlogPost.vue';
import { useTest } from "~/stores/test";
import { useMiscStore } from "~/stores/misc";

export default {
  setup() {
    const runtimeConfig = useRuntimeConfig()
    console.log('INDEX.VUE', runtimeConfig.public.api) // public is on server and in client
    // const appConfig = useAppConfig()
    // console.log("INDEX.VUE",appConfig.testing) // on server and in client

    const test = useTest()
    const miscStore = useMiscStore()
    miscStore.set({
            key: 'hideglobalwarning',
            value: false,
          })
    return { miscStore }
  },
  computed: {
    globalwarning() {
      return this.miscStore.get('hideglobalwarning')
    },
    test() {
      const test = useTest()
      return test
    }
  },
}
</script>
