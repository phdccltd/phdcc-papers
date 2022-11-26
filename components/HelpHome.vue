<template>
    <div class="mt-1 mb-1">
      <NoticeMessage v-if="showHelp" variant="info">
        <b-button variant="link" class="float-end" @click="toggleHelp">
          <v-icon icon="info-circle" scale="2" />
          Hide this
        </b-button>
        <p v-if="custom">
          <strong>{{custom}}</strong>
        </p>
        <p>
          Here's the Control Panel for all your conferences/journals.
        </p>
        <ul>
          <li>Click on the conference button to work on your conference/journal.</li>
          <li>In the top menu, use the Account button to change your password.</li>
          <li>The top left home icon <v-icon icon="home" scale="1" /> brings you back here and Logout <v-icon icon="sign-out-alt" scale="1" /> does just that.</li>
        </ul>
      </NoticeMessage>
      <div v-else class="text-primary text-end clickme" @click="toggleHelp">
        <v-icon icon="question-circle" />
        Show help
      </div>
    </div>
  </template>
  <script>
    import NoticeMessage from './NoticeMessage.vue'
    import helpBox from '@/mixins/helpBox'
  
    export default {
      components: { NoticeMessage },
      mixins: [helpBox],
      data: function () {
        return {
          id: 'home'
        }
      },
      props: {
        custom: { type: String },
      },
    }
  </script>
  