const testutils = require('./testutils')

describe('Author basic actions', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb()
  })

  it('log in as author and submit proposal', () => {
    cy.login(testutils.users.author1.username, testutils.users.author1.password)

    // Go to Author panel for pub 1
    cy.visit('/panel')

    cy.get('[data-cy="panel-pub-1"]').click()

    cy.url().should('include', '/panel/1')

    cy.get('[data-cy="pubsub-flow-action-1"]').click()

    cy.visit('/panel/1/1/add/1')
    cy.url().should('include', '/panel/1/1/add/1')

    cy.get('[data-cy="forminput-field0"]').type('Lorem ipsum')
    cy.get('[data-cy="forminput-field1"]').type('Jo Bloggs')
    cy.get('[data-cy="formlookups-field2"]').select('1')
    cy.get('[data-cy="formtext-field3"]').type('The quick brown fox jumps over the lazy dog')
    cy.get('[data-cy="formyesno-field4"]').get('[value="0"]').click()
    cy.get('[data-cy="entryform-submit"]').click()
    cy.url().should('include', '/panel/1/1/1')

    cy.visit('/panel/1')
    cy.get('[data-cy="helppanel-toggle"]').should('be.visible')
    
    cy.visit('/panel/1/1/1')
    cy.get('[data-cy="helppanelsubmit-toggle"]').should('be.visible')
  })
})
