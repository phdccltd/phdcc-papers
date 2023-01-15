describe('Register new user', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb()
  })

  it('register new user', () => {
    cy.visit('/register')

    const username = "author5"
    const email = "author5@example.org"
    const password = "author5-pwd"

    cy.get('#username').type(username)
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.get('#agreed').click()
    cy.get('form').contains('Register').click()

    cy.url().should('include', '/panel')
    cy.contains('Hello '+username)
    //cy.wait(500)
    //cy.screenshot()
  })
})