const testutils = require('./testutils')

describe('Author basic actions', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb()
  })

  it('log in as author and submit proposal', () => {
    console.log(testutils.users)
    cy.login(testutils.users.author1.username, testutils.users.author1.password)

    // Go to Author panel for pub 1
    cy.visit('/panel')

    cy.get('[data-cy="panel-pub-1"]').click()

    cy.url().should('include', '/panel/1')

    cy.get('[data-cy="pubsub-flow-action-1"]').click()

    cy.url().should('include', '/panel/1/1/add/1')
  })
})