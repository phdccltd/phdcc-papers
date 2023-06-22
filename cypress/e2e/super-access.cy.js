const testutils = require('./testutils')

describe('Super admin access', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb()
  })

  it('log in as super and visit admin pages', () => {
    cy.login(testutils.users.jo.username, testutils.users.jo.password)

    // Go to Super admin page
    cy.visit('/admin')

    // Click to go to Site pages
    cy.contains('Site pages').click()
    cy.url().should('include', '/admin/site-pages')

    // Add a first site page
    cy.get('[data-cy="startAddSitePage"]').click()

    cy.get('[data-cy="showSitePageModal"]')
    cy.get('#pagepath').type('/')
    cy.get('#pagetitle').type('Welcome')
    cy.get('#pagecontent').type('Lorem ipsum')
    cy.get('[data-cy="okSitePage"]').click()
    
    //cy.get('#modal-msgbox-ok-label').should('be.visible')
    cy.get('[data-cy="MessageBoxOK-ok"]').should('be.visible')
    cy.get('[data-cy="MessageBoxOK-ok"]').click()
    
    // Check home now has correct contents
    cy.visit('/')
    cy.get('[data-cy="layout-h1"]').contains('Welcome') // FIX
    cy.get('[data-cy="index-sitepages-content"]').contains('Lorem ipsum') // FIX

    // Go to Site pages - check missing fields errors
    cy.visit('/admin/site-pages')
    cy.get('[data-cy="startAddSitePage"]').click()
    cy.get('[data-cy="showSitePageModal"]')
    // pagepath missing
    cy.get('[data-cy="okSitePage"]').click()
    cy.get('#modal-msgbox-ok-label').should('be.visible')
    cy.get('[data-cy="MessageBoxOK-ok"]').click()
    // pagetitle missing
    cy.get('#pagepath').type('/terms')
    cy.get('[data-cy="okSitePage"]').click()
    cy.get('#modal-msgbox-ok-label').should('be.visible')
    cy.get('[data-cy="MessageBoxOK-ok"]').click()
    // pagecontent missing
    cy.get('#pagetitle').type('Terms and Conditions')
    cy.get('[data-cy="okSitePage"]').click()
    cy.get('#modal-msgbox-ok-label').should('be.visible')
    cy.get('[data-cy="MessageBoxOK-ok"]').click()
    // OK now
    cy.get('#pagecontent').type('Caveat emptor')
    cy.get('[data-cy="okSitePage"]').click()
    cy.get('#modal-msgbox-ok-label').should('be.visible')
    cy.get('[data-cy="MessageBoxOK-ok"]').click()

    // Check ad hoc page  has correct contents
    cy.visit('/terms')
    cy.get('[data-cy="layout-h1"]').contains('Terms and Conditions')
    cy.get('[data-cy="id-sitepages-content"]').contains('Caveat emptor')

    // Go to Site pages - check cancel add
    cy.visit('/admin/site-pages')
    cy.get('[data-cy="startAddSitePage"]').click()
    cy.get('[data-cy="showSitePageModal"]')
    cy.get('[data-cy="cancelSitePage"]').click()

    // Delete second site page
    cy.get('[data-cy="deleteSitePage-2"]').click()
    cy.get('[data-cy="ConfirmModal-cancel"]').click()
    cy.get('[data-cy="deleteSitePage-2"]').click()
    cy.get('[data-cy="ConfirmModal-confirm"]').click()
    cy.get('[data-cy="MessageBoxOK-ok"]').click()
    cy.get('[data-cy="deleteSitePage-2"]').should('not.exist')

    // Edit first site page
    cy.get('[data-cy="editSitePage-1"]').click()
    cy.get('#pagepath').should('have.value', '/')
    cy.get('#pagetitle').should('have.value', 'Welcome')
    cy.get('#pagecontent').should('have.value', 'Lorem ipsum')
    cy.get('#pagetitle').clear().type('Welcomed')
    cy.get('[data-cy="okSitePage"]').click()
    cy.get('[data-cy="MessageBoxOK-ok"]').click()
    cy.get('[data-cy="sitePageTitle-1"]').contains('Welcomed')

    // Toggle site page show
    cy.get('[data-cy="sitePageTitle-1"]').click()
    cy.get('[data-cy="sitePageVisibleContent-1"]')
    cy.get('[data-cy="sitePageTitle-1"]').click()
    cy.get('[data-cy="sitePageVisibleContent-1"]').should('not.exist')
  })
})
