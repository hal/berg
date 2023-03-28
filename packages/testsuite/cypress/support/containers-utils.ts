/// <reference types="cypress" />


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

export {};
/* eslint @typescript-eslint/no-namespace: off */
declare global {
  namespace Cypress {
    interface Chainable {
      startWildflyContainer(): Chainable<unknown>;
      executeInWildflyContainer(command: string): Chainable<unknown>;
    }
  }
}
