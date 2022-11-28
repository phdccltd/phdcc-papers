import AuthAPI from './AuthAPI.js'
import PubAPI from './PubAPI.js'
import SitePagesAPI from './SitePagesAPI.js'

export default {
    auth: new AuthAPI(),
    pubs: new PubAPI(),
    sitepages: new SitePagesAPI(),
}
