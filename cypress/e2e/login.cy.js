const testutils = require('./testutils')

describe('Basic login and view account', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb()
  })

  it('existing login author1', () => {
    cy.login(testutils.users.author1.username, testutils.users.author1.password)

    cy.visit('/account')
    cy.get('[data-cy="account-save"]').should('be.visible')
  })

  
})