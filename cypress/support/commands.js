// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('resetdb', () => {
  const api = 'http://localhost:9000/api'
  console.log(api)
  cy.request('DELETE', api + '/resetdbfortest')
    .then((response) => {
      expect(response.body.ret).to.eq(0)
    })
})

Cypress.Commands.add('login', (username, password) => {
  cy.session(
    username,
    () => {
      cy.visit('/login')
      cy.get('#username').type(username)
      cy.get('#password').type(password)
      //cy.get('input[name=password]').type(`${password}{enter}`, { log: false })
      cy.get('form').contains('Login').click()

      cy.url().should('include', '/login')
    }
    //,
    //{
    //  validate: () => {
    //    //cy.getCookie('your-session-cookie').should('exist')
    //  },
    //}
  )
})