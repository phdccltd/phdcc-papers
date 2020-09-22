/*    --- DO NOT EDIT ---
 *
 * This file was generating using api/index.generate.js
 * You can regenerate it by running:
 *
 *     node api/index.generate.js
 *
 *    --- DO NOT EDIT ---
 */

import acceptingsAPI from './acceptingsAPI.js'
import downloadsAPI from './downloadsAPI.js'
import gradingsAPI from './gradingsAPI.js'
import mailAPI from './mailAPI.js'
import pubAPI from './pubAPI.js'
import reviewersAPI from './reviewersAPI.js'
import sitepagesAPI from './sitepagesAPI.js'
import submitAPI from './submitAPI.js'
import userAPI from './userAPI.js'

export default ({ $axios, store }) => {
  const options = { $axios, store }
  return {
    acceptings: new acceptingsAPI(options),
    downloads: new downloadsAPI(options),
    gradings: new gradingsAPI(options),
    mail: new mailAPI(options),
    pub: new pubAPI(options),
    reviewers: new reviewersAPI(options),
    sitepages: new sitepagesAPI(options),
    submit: new submitAPI(options),
    user: new userAPI(options),
  }
}
