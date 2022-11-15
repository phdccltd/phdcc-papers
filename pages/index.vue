<template>
  <div>
    <h1>Welcome to the homepage</h1>
    <AppAlert> This is an auto-imported component in AppAlert </AppAlert>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
})

const runtimeConfig = useRuntimeConfig()
console.log('INDEX.VUE', runtimeConfig.public.api) // public is on server and in client
// const appConfig = useAppConfig()
// console.log("INDEX.VUE",appConfig.testing) // on server and in client
</script>
