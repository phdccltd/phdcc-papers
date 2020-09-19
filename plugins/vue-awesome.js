// Runs in client
// https://github.com/Justineo/vue-awesome
// https://fontawesome.com/icons?d=gallery&m=free

import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon.vue'

require('vue-awesome/icons/question-circle')
require('vue-awesome/icons/info-circle')
require('vue-awesome/icons/home')
require('vue-awesome/icons/sign-out-alt')
require('vue-awesome/icons/plus-circle')
require('vue-awesome/icons/plus-square')
require('vue-awesome/icons/minus-square')
require('vue-awesome/icons/edit')
require('vue-awesome/icons/times-circle')
require('vue-awesome/icons/envelope')
require('vue-awesome/icons/check-circle')

Vue.component('v-icon', Icon)

