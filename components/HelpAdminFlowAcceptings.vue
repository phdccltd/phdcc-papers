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
        Use this page to specify what stages are open for submissions.
      </p>
      <p>
        Most stages open automatically when the submission is at the correct status.
        If you wish to override this, then specify settings here.
      </p>
      <p>
        In most cases, once set up, you will not add or remove entries here.
        Instead, change the setting from Closed to Open or vice versa.
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
      id: 'admin-flow-acceptings'
    }
  },
  props: {
    custom: { type: String },
  },
}
</script>
