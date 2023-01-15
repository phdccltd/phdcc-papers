const testutils = require('./testutils')

describe('Basic login', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb()
  })

  it('existing login author1', () => {
    console.log(testutils.users)
    cy.login(testutils.users.author1.username, testutils.users.author1.password)
    cy.visit('/account')
  })

  
})