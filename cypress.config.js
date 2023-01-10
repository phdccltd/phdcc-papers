const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env: {
    // login_url: '/login'  // Use as Cypress.env('login_url')
  },
  e2e: {
    baseUrl: 'http://localhost:4445',  // should be in cypress.env.json

    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('@cypress/code-coverage/task')(on, config)
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config
    },
  },
});
