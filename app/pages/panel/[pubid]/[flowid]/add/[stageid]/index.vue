<template>
  <div>
    <!-- ADD NEW SUBMIT -->
    <EntryForm formtype="addsubmit" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["authuser"]
})
</script>
