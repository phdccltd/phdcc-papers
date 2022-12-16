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
        Super-admin control panel
      </p>
      <ul>
        <li>Enable and disable publications</li>
        <li>Add owners to publications</li>
      </ul>
      <p>
        Note: to remove or change other roles, click through to administer the publication.
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
      id: 'admin'
    }
  },
  props: {
    custom: { type: String },
  },
}
</script>
