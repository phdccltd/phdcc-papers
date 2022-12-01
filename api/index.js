import AcceptingsAPI from './AcceptingsAPI.js'
import AuthAPI from './AuthAPI.js'
import PubAPI from './PubAPI.js'
import SitePagesAPI from './SitePagesAPI.js'
import SubmitAPI from './SubmitAPI.js'

export default {
  acceptings: new AcceptingsAPI(),
  auth: new AuthAPI(),
  pubs: new PubAPI(),
  sitepages: new SitePagesAPI(),
  submit: new SubmitAPI(),
}
