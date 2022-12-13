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

Cypress.Commands.add('navigateTo', (managementEndpoint, token) => {
  cy.intercept('POST', 'https://www.google-analytics.com/j/collect*').as('loadPage')
  cy.visit('?connect=' + managementEndpoint + '#' + token)
  cy.wait('@loadPage').its('response.statusCode').should('eq', 200)
  cy.get('#hal-root-container').should('be.visible')
})

Cypress.Commands.add('navigateToGenericSubsystemPage', (managementEndpoint, address) => {
  const rootSeparator = '%255C0'
  const subsystemSeparator = '%255C2'
  cy.intercept('POST', 'https://www.google-analytics.com/j/collect*').as('loadPage')
  cy.visit('?connect=' + managementEndpoint + '#generic-subsystem;address=' + rootSeparator + address.join(subsystemSeparator))
  cy.wait('@loadPage').its('response.statusCode').should('eq', 200)
  cy.get('#hal-root-container').should('be.visible')
})

Cypress.Commands.add('editForm', (configurationFormId) => {
  const editButton = '#' + configurationFormId + ' a.clickable[data-operation="edit"'
  cy.get(editButton).click()
})

Cypress.Commands.add('saveForm', (configurationFormId) => {
  const saveButton = '#' + configurationFormId + '-editing button.btn.btn-hal.btn-primary:contains("Save")'
  cy.get(saveButton).scrollIntoView().click()
})

Cypress.Commands.add('formInput', (configurationFormId, attributeName) => {
  return cy.get('#' + configurationFormId + '-' + attributeName + '-editing')
}) 

Cypress.Commands.add('flip', (configurationFormId, attributeName, value) => {
  cy.formInput(configurationFormId, attributeName).wait(1000).should(($input) => {
    if (value) {
      expect($input).to.be.checked
    } else {
      expect($input).to.not.be.checked
    }
  })
  cy.get('div[data-form-item-group="' + configurationFormId + '-' + attributeName + '-editing"] .bootstrap-switch-label').click().wait(1000)
  cy.formInput(configurationFormId, attributeName).should(($input) => {
    if (value) {
      expect($input).to.not.be.checked
    } else {
      expect($input).to.be.checked
    }
  })
})

Cypress.Commands.add('resetForm', (configurationFormId, managementApi, address) => {
  const resetButton = '#' + configurationFormId + ' a.clickable[data-operation="reset"'
  cy.get(resetButton).click()
  cy.get('.modal-footer .btn-primary').click({force: true})
  cy.verifySuccess()
  cy.task('execute:cli', {
    managementApi: managementApi,
    operation: 'read-resource-description',
    address: address
  }).then((result: any) => {
    expect(result.outcome).to.equal('success')
    let attributes = result.result.attributes
    let attributesWithDefaultValues = Object.keys(attributes).filter((key: string) => attributes[key].hasOwnProperty('default')).map((key) => {
      let obj: {[index: string]:any} = {}
      obj['name'] = key
      obj['defaultValue'] = attributes[key].default
      return obj
    })
    attributesWithDefaultValues.forEach(attributeWithDefaultValue => {
      cy.task('execute:cli', {
        managementApi: managementApi,
        operation: 'read-attribute',
        address: address,
        name: attributeWithDefaultValue.name
      }).then((result:any) => {
        expect(result.outcome).to.equal('success')
        expect(result.result).to.equal(attributeWithDefaultValue.defaultValue)
      })
    })
  })
})

Cypress.Commands.add('text', (configurationFormId, attributeName, value) => {
  cy.formInput(configurationFormId, attributeName).click({force: true}).then(($textInput) => {
    if ($textInput.val()) {
      cy.formInput(configurationFormId, attributeName).clear()
    }
  }).type(value).should('have.value', value).trigger('change')
})

Cypress.Commands.add('clearAttribute', (configurationFormId, attributeName) => {
  cy.formInput(configurationFormId, attributeName).clear().trigger('change')
})

Cypress.Commands.add('verifySuccess', () => {
  cy.get('.toast-notifications-list-pf .alert-success').should('be.visible')
})

Cypress.Commands.add('startWildflyContainer', () => {
  return cy.task('start:wildfly:container', {name: Cypress.spec.name.replace(/\.cy\.ts/g,'').replace(/-/g,'_') })
})

Cypress.Commands.add('executeInWildflyContainer', (command) => {
  return cy.task('execute:in:container', {containerName: Cypress.spec.name.replace(/\.cy\.ts/g,'').replace(/-/g,'_'), command: command})
})

export {};
declare global {
  namespace Cypress {
    interface Chainable {
      flip(configurationFormId: string, attributeName: string, value: boolean): Chainable<void>
      text(configurationFormId: string, attributeName: string, value: string) : Chainable<void>
      clearAttribute(configurationFormId: string, attributeName: string) : Chainable<void>
      editForm(configurationFormId: string): Chainable<void>
      formInput(configurationFormId: string, attributeName: string) : Chainable<JQuery<HTMLElement>>
      saveForm(configurationFormId: string) : Chainable<void>
      resetForm(configurationFormId: string, managementApi: string, address: string[]): Chainable<void>
      navigateTo(managementEndpoint: any, token: string) : Chainable<void>
      navigateToGenericSubsystemPage(managementEndpoint: any, address: string[]) : Chainable<void>
      verifySuccess(): Chainable<void>
      startWildflyContainer() : Chainable<unknown>
      executeInWildflyContainer(command: string) : Chainable<unknown>
    }
  }
}