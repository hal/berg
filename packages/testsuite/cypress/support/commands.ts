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

Cypress.Commands.add("formInput", (configurationFormId, attributeName) => {
  return cy.get("#" + configurationFormId + "-" + attributeName + "-editing");
});

Cypress.Commands.add("getDefaultBooleanValue", (managementEndpoint, address, name) => {
  return cy
    .task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: address,
      name: name,
    })
    .then((result) => {
      return (result as { result: boolean }).result;
    });
});

Cypress.Commands.add("startWildflyContainer", () => {
  return cy.task("start:wildfly:container", {
    name: Cypress.spec.name.replace(/\.cy\.ts/g, "").replace(/-/g, "_"),
  });
});

Cypress.Commands.add("executeInWildflyContainer", (command) => {
  return cy.task("execute:in:container", {
    containerName: Cypress.spec.name.replace(/\.cy\.ts/g, "").replace(/-/g, "_"),
    command: command,
  });
});

Cypress.Commands.add("verifyRemovedFromTable", (tableId, resourceName) => {
  const tableWrapper = `#${tableId}_wrapper`;
  cy.get(`${tableWrapper} td:contains("${resourceName}")`).should("not.exist");
});

export {};
/* eslint @typescript-eslint/no-namespace: off */
declare global {
  namespace Cypress {
    interface Chainable {
      startWildflyContainer(): Chainable<unknown>;
      executeInWildflyContainer(command: string): Chainable<unknown>;
      formInput(configurationFormId: string, attributeName: string): Chainable<JQuery<HTMLElement>>;
      getDefaultBooleanValue(managementEndpoint: string, address: string[], name: string): Chainable<boolean>;
      verifyRemovedFromTable(tableId: string, resourceName: string): void;
    }
  }
}
