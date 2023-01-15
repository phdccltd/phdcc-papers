const testutils = require('./testutils')

describe('Login using recaptcha', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb()
  })

  it('existing login recapturer', () => {
    console.log(testutils.users)
    cy.login(testutils.users.recapturer.username, testutils.users.recapturer.password)
    cy.visit('/account')
  })

  
})