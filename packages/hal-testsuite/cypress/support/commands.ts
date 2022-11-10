/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
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
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// 

Cypress.Commands.add('flip', (configurationFormId, attributeName, value) => {
  const editButton = '#' + configurationFormId + ' a.clickable[data-operation="edit"'
  const switchSelector = '#' + configurationFormId + '-' + attributeName + '-editing'
  cy.get(editButton).click()
  cy.get(switchSelector).wait(1000).should(($input) => {
    if (value) {
      expect($input).to.be.checked
    } else {
      expect($input).to.not.be.checked
    }
  }).invoke('click').wait(1000).should(($input) => {
    if (value) {
      expect($input).to.not.be.checked
    } else {
      expect($input).to.be.checked
    }
  })
  cy.get('#' + configurationFormId + '-editing button.btn.btn-hal.btn-primary:contains("Save")').click()
})

Cypress.Commands.add('verifySuccess', () => {
  cy.get('.toast-notifications-list-pf .alert-success').should('be.visible')
})

export {};
declare global {
  namespace Cypress {
    interface Chainable {
      flip(configurationFormId: string, attributeName: string, value: boolean): Chainable<void>
      verifySuccess(): Chainable<void>
    }
  }
}