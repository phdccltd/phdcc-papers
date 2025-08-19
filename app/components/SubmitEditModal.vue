<template>
  <div>
    <b-modal ref="modal" id="modal-edit-submit" title="Edit submission title and author" size="lg" centered>
      <template #default>
        <form ref="form" @submit.stop.prevent>
          <b-form-group label="Title" label-for="new-title" invalid-feedback="Title is required" :state="true">
            <b-form-input id="new-title" required v-model="thenewtitle"></b-form-input>
          </b-form-group>
          <b-form-group label="Author" label-for="new-author" :state="true">
            <b-form-select id="new-author" v-model="thenewauthor" :options="newauthoroptions"></b-form-select>
          </b-form-group>
        </form>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="hide"> Cancel </b-button>
        <b-button variant="primary" @click="okEdited"> OK </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
const modal = ref()

const thenewtitle = ref('')
const thenewauthor = ref(0)

const props = defineProps({
  newauthoroptions: {
    type: Object,
    required: true,
  },
  newtitle: {
    type: String,
    required: true,
  },
  newauthor: {
    type: Number,
    required: true,
  },
})

onMounted(() => {
  modal.value?.show()
  thenewtitle.value = props.newtitle
  thenewauthor.value = props.newauthor
})

const emit = defineEmits([
  'confirm',
  'hidden'
])

function okEdited() {
  emit('confirm', thenewtitle.value, thenewauthor.value)
}

function hide() {
  modal.value?.hide()
  emit('hidden')
}
</script>