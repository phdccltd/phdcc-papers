// Runs in both client & server

import api from '~/api'

export default (ctx, inject) => {
  inject('api', api(ctx)) // Becomes app this.$api.etc
}
