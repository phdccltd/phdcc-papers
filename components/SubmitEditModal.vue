<template>
  <div>
    <b-modal v-model="showModal" id="modal-edit-submit" title="Edit submission title and author" size="lg" centered>
      <template #default>
        <form ref="form" @submit.stop.prevent>
          <b-form-group label="Title" label-for="new-title" invalid-feedback="Title is required">
            <b-form-input id="new-title" required v-model="newtitle"></b-form-input>
          </b-form-group>
          <b-form-group label="Author" label-for="newauthor">
            <b-form-select v-model="newauthor" :options="newauthoroptions"></b-form-select>
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

<script lang="ts">
import modal from '@/mixins/modal'

export default {
  mixins: [modal],
  props: {
    newauthoroptions: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      newtitle: '',
      newauthor: 0,
    }
  },
  methods: {
    show(title: string, author: number) {
      this.newtitle = title
      this.newauthor = author
      this.showModal = true
    },
    okEdited() {
      this.$emit('confirm', this.newtitle, this.newauthor)
    }
  }
}
</script>