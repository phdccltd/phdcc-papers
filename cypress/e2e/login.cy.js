//import { testutils } from './testutils'

const testutils = require('./testutils')

describe('Basic login', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    cy.resetdb();
  })

  it('existing login author1', () => {
    const users = testutils
    console.log(users)
    cy.login(users.author1.username, users.author1.password)
    cy.visit('/account')
  })

  
})