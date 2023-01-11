describe('BASIC LOGIN', () => {
  beforeEach(() => {
    /*
    // reset and seed the database prior to every test
    cy.exec('npm run db:reset && npm run db:seed')

    // seed a user in the DB that we can control from our tests
    // assuming it generates a random password for us
    cy.request('POST', '/test/seed/user', { username: 'jane.lane' })
      .its('body')
      .as('currentUser')
      */
  })

  it('register new user', () => {
    cy.visit('/register')

    const username = Cypress.env('username')
    const email = Cypress.env('email')
    const password = Cypress.env('password')

    cy.get('#username').type(username)
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.get('#agreed').click()
    cy.get('form').contains('Register').click()

    cy.url().should('include', '/panel')
  })

  
})