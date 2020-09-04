/*    --- DO NOT EDIT ---
 *
 * This file was generating using api/index.generate.js
 * You can regenerate it by running:
 *
 *     node api/index.generate.js
 *
 *    --- DO NOT EDIT ---
 */

import mailtemplatesAPI from './mailtemplatesAPI.js'
import pubAPI from './pubAPI.js'
import sitepagesAPI from './sitepagesAPI.js'
import submitAPI from './submitAPI.js'
import userAPI from './userAPI.js'

export default ({ $axios, store }) => {
  const options = { $axios, store }
  return {
    mailtemplates: new mailtemplatesAPI(options),
    pub: new pubAPI(options),
    sitepages: new sitepagesAPI(options),
    submit: new submitAPI(options),
    user: new userAPI(options),
  }
}
