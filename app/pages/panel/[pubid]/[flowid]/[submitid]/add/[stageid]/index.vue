<template>
  <div>
    <!-- ADD ENTRY TO SUBMIT -->
    <EntryForm formtype="addstage" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["authuser"]
})
</script>
