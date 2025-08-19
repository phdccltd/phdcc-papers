<template>
  <span class="ms-1 me-1">
    {{ date }}
  </span>
</template>
<script setup lang="ts">
const props = defineProps({
  dt: { type: String },
})

const date = computed(() => {
  if (props.dt === null) return ''
  const dt = new Date(props.dt)
  return dt.toLocaleString()
})
</script>