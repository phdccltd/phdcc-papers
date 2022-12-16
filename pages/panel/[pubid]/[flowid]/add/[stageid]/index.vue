<template>
  <div>
    <!-- ADD NEW SUBMIT -->
    <EntryForm formtype="addsubmit" />
  </div>
</template>

<script lang="ts">

definePageMeta({
  middleware: ["authuser"]
})

export default {
  data() {
    return {
    }
  },
}
</script>
