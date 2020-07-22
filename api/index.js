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
import submitAPI from './submitAPI.js'
import userAPI from './userAPI.js'

export default ({ $axios, store }) => {
  const options = { $axios, store }
  return {
    pub: new pubAPI(options),
    submit: new submitAPI(options),
    user: new userAPI(options),
  }
}
