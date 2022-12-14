import AcceptingsAPI from './AcceptingsAPI.js'
import AuthAPI from './AuthAPI.js'
import GradingsAPI from './GradingsAPI.js'
import MailAPI from './MailAPI.js'
import PubAPI from './PubAPI.js'
import ReviewersAPI from './ReviewersAPI.js'
import SitePagesAPI from './SitePagesAPI.js'
import SubmitAPI from './SubmitAPI.js'

export default {
  acceptings: new AcceptingsAPI(),
  auth: new AuthAPI(),
  gradings: new GradingsAPI(),
  mail: new MailAPI(),
  pubs: new PubAPI(),
  reviewers: new ReviewersAPI(),
  sitepages: new SitePagesAPI(),
  submit: new SubmitAPI(),
}
