const testutils = require('./testutils')

describe('Super admin access', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb();
  })

  it('log in as super and visit admin pages', () => {
    console.log(testutils.users)
    cy.login(testutils.users.jo.username, testutils.users.jo.password)

    cy.visit('/admin')

    cy.contains('Site pages').click()

    cy.visit('/admin/site-pages')
  })
})