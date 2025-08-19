<template>
  <b-modal id="confirmmodal" ref="confirmmodal" :title="confirmTitle" centered>
    <template #default data-cy="ConfirmModal-message">
      {{  confirmMessage }}
    </template>
    <template #footer>
      <b-button variant="white" @click="cancel" data-cy="ConfirmModal-cancel"> {{ confirmCancelText }} </b-button>
      <b-button :variant="okVariant" @click="confirm" data-cy="ConfirmModal-confirm"> {{ confirmOKText }} </b-button>
    </template>
  </b-modal>
</template>
<script setup>
import { confirmmodal, confirmshow, confirmhide, confirmTitle, confirmMessage, confirmCancelText, confirmOKText, okVariant } from '~/composables/useModalBoxes'

onMounted(() => {
  confirmshow()
})

const props = defineProps({
})

const emit = defineEmits([
  'cancel',
  'confirm',
])

function cancel() {
  emit('cancel')
  confirmhide()
}

function confirm() {
  emit('confirm')
  confirmhide()
}
</script>
