<template>
  <div class="notice p-2 rounded-sm" :class="'notice--' + variant">
    <slot />
  </div>
</template>
  
<script>
export default {
  name: 'NoticeMessage',
  props: {
    variant: {
      type: String,
      required: false,
      default: 'info'
    }
  }
}
</script>
  
<style scoped lang="scss">
@use '../assets/css/_color-vars' as colors;

.notice {
  border-width: 1px;
  border-style: solid;
}

.notice--primary {
  background-color: colors.$color-white;
  border-color: colors.$colour-success-border;
  color: colors.$colour-success-fg;
}

.notice--info {
  background-color: colors.$color-blue--x-light;
  border-color: colors.$color-blue-x-light2;
  color: colors.$color-blue--1;
}

.notice--warning {
  background-color: colors.$color-yellow-1;
  border-color: colors.$color-yellow-2;
  color: colors.$color-yellow-3;
}

.notice--danger {
  background-color: colors.$color-red--lighter;
  border-color: colors.$color-red--light;
  color: colors.$color-red--dark;
}
</style>
  