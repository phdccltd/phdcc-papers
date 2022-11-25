import AuthAPI from './AuthAPI.js'
import SitePagesAPI from './SitePagesAPI.js'

export default (config) => {
    const options = config
    return {
        auth: new AuthAPI(options),
        sitepages: new SitePagesAPI(options),
    }
}