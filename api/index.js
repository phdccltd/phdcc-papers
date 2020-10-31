/*    --- DO NOT EDIT ---
 *
 * This file was generating using api/index.generate.js
 * You can regenerate it by running:
 *
 *     node api/index.generate.js
 *
 *    --- DO NOT EDIT ---
 */

import AcceptingsAPI from './AcceptingsAPI.js'
import DownloadsAPI from './DownloadsAPI.js'
import GradingsAPI from './GradingsAPI.js'
import MailAPI from './MailAPI.js'
import PubAPI from './PubAPI.js'
import ReviewersAPI from './ReviewersAPI.js'
import SitePagesAPI from './SitePagesAPI.js'
import SubmitAPI from './SubmitAPI.js'
import UserAPI from './UserAPI.js'

export default ({ $axios, store }) => {
  const options = { $axios, store }
  return {
    acceptings: new AcceptingsAPI(options),
    downloads: new DownloadsAPI(options),
    gradings: new GradingsAPI(options),
    mail: new MailAPI(options),
    pub: new PubAPI(options),
    reviewers: new ReviewersAPI(options),
    sitepages: new SitePagesAPI(options),
    submit: new SubmitAPI(options),
    user: new UserAPI(options)
  }
}
