<template>
  <div class="mt-1 mb-1">
    <NoticeMessage v-if="showHelp" variant="info">
      <b-button variant="link" class="float-end" @click="toggleHelp">
        <v-icon icon="info-circle" size="2x" title="Hide help" />
        Hide this
      </b-button>
      <p v-if="custom">
        <strong>{{ custom }}</strong>
      </p>
      <p>
        Use this page to do bulk operations on submits, ie
      </p>
      <ul>
        <li>Move all submits forward by adding a new status.</li>
      </ul>
      <p>
        You might then use the <a href="admin-mail">send email</a> admin option to inform all users in a particular role eg to ask them to score
        abstracts.
      </p>
    </NoticeMessage>
    <div v-else class="text-primary text-end clickme" @click="toggleHelp">
      <v-icon icon="question-circle" title="Show help" />
      Show help
    </div>
  </div>
</template>
<script>
import helpBox from '@/mixins/helpBox'

export default {
  mixins: [helpBox],
  data: function () {
    return {
      id: 'admin-downloads'
    }
  },
  props: {
    custom: { type: String },
  },
}
</script>
