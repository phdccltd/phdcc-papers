const testutils = require('./testutils')

describe('Password reset', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb()
  })

  it('Password reset', () => {
    //cy.login(testutils.users.author1.username, testutils.users.author1.password)

    cy.visit('/resetpwd')
    cy.get('[data-cy="messages-error"]').should('be.visible')
  })

  
})