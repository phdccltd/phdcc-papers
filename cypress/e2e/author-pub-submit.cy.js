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

    cy.get('[data-cy="forminput-field0"]').type('Lorem ipsum')
    cy.get('[data-cy="forminput-field1"]').type('Jo Bloggs')
    cy.get('[data-cy="formlookups-field2"]').contains('Climate Change').click()
    cy.get('[data-cy="formtext-field3"]').type('The quick brown fox jumps over the lazy dog')
    cy.get('[data-cy="formyesno-field4"]').get('#field4_option_0').click()
    cy.get('[data-cy="entryform-submit"]').click()

    
  })
})