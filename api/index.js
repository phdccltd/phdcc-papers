import AuthAPI from './AuthAPI.js'
import PubAPI from './PubAPI.js'
import SitePagesAPI from './SitePagesAPI.js'
import SubmitAPI from './SubmitAPI.js'

export default {
    auth: new AuthAPI(),
    pubs: new PubAPI(),
    sitepages: new SitePagesAPI(),
    submit: new SubmitAPI(),
}
