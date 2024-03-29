const testutils = require('./testutils')

describe('Owner admin actions', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb()
  })

  it('log in as owner and visit pub admin pages', () => {
    cy.login(testutils.users.owner1.username, testutils.users.owner1.password)

    // Go to Super admin page
    cy.visit('/panel')

    cy.get('[data-cy="panel-pub-1"]').click()

    cy.url().should('include', '/panel/1')

    // Go to Admin Users
    cy.get('[data-cy="pubsub-admin-options"]').click()
    cy.get('[data-cy="pubsub-admin-users"]').click()
    cy.url().should('include', '/panel/1/admin-users')
    cy.get('[data-cy="adminusers-pubusers"]').should('be.visible')
    
    // Go to Admin Bulk
    cy.visit('/panel/1')
    //cy.get('[data-cy="layout-h1-a"]').click()
    //cy.url().should('include', '/panel/1')
    cy.get('[data-cy="pubsub-admin-options"]').click()
    cy.get('[data-cy="pubsub-admin-bulk"]').click()
    cy.url().should('include', '/panel/1/admin-bulk')
    cy.get('[data-cy="adminbulk-move"]').should('be.visible')
    
    // Go to Admin Mail templates
    cy.get('[data-cy="layout-h1-a"]').click()
    cy.url().should('include', '/panel/1')
    cy.get('[data-cy="pubsub-admin-options"]').click()
    cy.get('[data-cy="pubsub-admin-mailtemplates"]').click()
    cy.url().should('include', '/panel/1/admin-mail-templates')
    cy.get('[data-cy="admintemplates-add"]').should('be.visible')
    cy.get('[data-cy="helpadminmailtemplates-hide"]').should('be.visible')
    cy.get('[data-cy="helpadminmailtemplates-hide"]').click()
    
    // Go to Admin Send email
    cy.get('[data-cy="layout-h1-a"]').click()
    cy.url().should('include', '/panel/1')
    cy.get('[data-cy="pubsub-admin-options"]').click()
    cy.get('[data-cy="pubsub-admin-emails"]').click()
    cy.url().should('include', '/panel/1/admin-mail')
    cy.get('[data-cy="adminmail-send"]').should('be.visible')

    // Go to Admin Downloads
    cy.get('[data-cy="layout-h1-a"]').click()
    cy.url().should('include', '/panel/1')
    cy.get('[data-cy="pubsub-admin-options"]').click()
    cy.get('[data-cy="pubsub-admin-downloads"]').click()
    cy.url().should('include', '/panel/1/admin-downloads')
    cy.get('[data-cy="admindownloads-reviewer"]').should('be.visible')

    // Go to Admin Setup
    cy.visit('/panel/1')
    cy.get('[data-cy="pubsub-admin-setup"]').click()
    cy.url().should('include', '/panel/1/admin-setup')
    cy.get('[data-cy="helpadminsetup-toggle"]').should('be.visible')
    cy.get('[data-cy="helpadminsetup-toggle"]').click()
    
    // Go to Flow Stage status acceptings
    cy.visit('/panel/1')
    cy.get('[data-cy="pubsub-admin-options"]').click()
    cy.get('[data-cy="pubsub-flow-status-1"]').click()
    cy.url().should('include', '/panel/1/1/admin-flow-acceptings')
  })
})