// https://nitro.unjs.io/guide/advanced/plugins

import { execFileSync } from 'child_process'

export default defineNitroPlugin((nitroApp) => {
  console.log('nitroStartup plugin') // nitroApp

  try {
    const runtimeConfig = useRuntimeConfig()

    if (runtimeConfig.public.STARTUP_EMAIL && runtimeConfig.public.STARTUP_SUBJECT && runtimeConfig.public.STARTUP_FROM && runtimeConfig.public.VERSION) {
      console.log('SEND MAIL TO ', runtimeConfig.public.STARTUP_EMAIL)
      const now = new Date()
      //const args = ['-s', runtimeConfig.public.STARTUP_SUBJECT + ' ' + runtimeConfig.public.VERSION, '-a', 'From:' + runtimeConfig.public.STARTUP_FROM, runtimeConfig.public.STARTUP_EMAIL]
      //execFileSync('mail', args, { input: 'Server: ' + now.toISOString() + ' to API ' + runtimeConfig.public.API })
      const Message = "Subject: " + runtimeConfig.public.STARTUP_SUBJECT + "\r\nFrom: " + runtimeConfig.public.STARTUP_FROM +
        'Server: ' + now.toISOString() + ' to API ' + runtimeConfig.public.API
      execFileSync('sendmail', [runtimeConfig.public.STARTUP_EMAIL], { input: Message })

    }
  } catch (e) {
    console.log('nitroStartup error', e.message)
  }

})

/*
Nitro plugin {
  hooks: Hookable {
    _hooks: {},
    _before: undefined,
    _after: undefined,
    _deprecatedMessages: undefined,
    _deprecatedHooks: {},
    hook: [Function: bound hook],
    callHook: [Function: bound callHook],
    callHookWith: [Function: bound callHookWith]
  },
  h3App: {
    use: [Function: use],
    handler: [AsyncFunction (anonymous)] { __is_handler__: true },
    stack: [ [Object], [Object], [Object], [Object] ],
    options: { debug: false, onError: [AsyncFunction: errorhandler] }
  },
  router: {
    add: [Function (anonymous)],
    use: [Function (anonymous)],
    connect: [Function (anonymous)],
    delete: [Function (anonymous)],
    get: [Function (anonymous)],
    head: [Function (anonymous)],
    options: [Function (anonymous)],
    post: [Function (anonymous)],
    put: [Function (anonymous)],
    trace: [Function (anonymous)],
    patch: [Function (anonymous)],
    handler: [Function (anonymous)] { __is_handler__: true }
  },
  localCall: [Function: callHandle],
  localFetch: [AsyncFunction: ufetch]
}
*/