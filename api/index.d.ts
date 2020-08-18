
/*    --- DO NOT EDIT ---
 *
 * This file was generating using api/index.generate.js
 * You can regenerate it by running:
 *
 *     node api/index.generate.js
 *
 *    --- DO NOT EDIT ---
 */


import pubAPI from './pubAPI.js'
import sitepagesAPI from './sitepagesAPI.js'
import submitAPI from './submitAPI.js'
import userAPI from './userAPI.js'

interface API {
  pub: pubAPI;
  sitepages: sitepagesAPI;
  submit: submitAPI;
  user: userAPI;
}

declare module 'vue/types/vue' {
  interface Vue {
    $api: API;
  }
}