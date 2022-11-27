import AuthAPI from './AuthAPI.js'
import PubAPI from './PubAPI.js'
import SitePagesAPI from './SitePagesAPI.js'

export default (config) => {
    const options = config
    return {
        auth: new AuthAPI(options),
        pubs: new PubAPI(options),
        sitepages: new SitePagesAPI(options),
    }
}