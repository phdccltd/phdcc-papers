<template>
  <div>
    <!-- ENTRY LISTING: SHOW OR EDIT -->
    <EntryForm formtype="showedit" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["authuser"]
})
</script>
