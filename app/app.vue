<template>
  <NuxtLayout name="defaults">
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.1s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>

<script setup>
  console.log("phdcc-papers")
  const runtimeConfig = useRuntimeConfig()
  console.log("public.API", runtimeConfig.public.API)
  console.log("public.VERSION", runtimeConfig.public.VERSION)
  console.log("public.BUILD_DATE", runtimeConfig.public.BUILD_DATE)
  console.log("public.RECAPTCHA_SITE_KEY", runtimeConfig.public.RECAPTCHA_SITE_KEY)
  console.log("public.SITE", runtimeConfig.public.SITE)
  console.log("NODE_ENV", process.env.NODE_ENV)
</script>
