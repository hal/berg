/// <reference types="cypress" />

Cypress.Commands.add("createMailSession", (managementEndpoint, mailSession) => {
  cy.addAddress(managementEndpoint, ["subsystem", "mail", "mail-session", mailSession.mailSessionName], {
    "jndi-name": mailSession.jndiName,
  });
});

Cypress.Commands.add("createOutboundSocketBinding", (managementEndpoint, socketBinding) => {
  cy.addAddress(
    managementEndpoint,
    ["socket-binding-group", "standard-sockets", "remote-destination-outbound-socket-binding", socketBinding.name],
    socketBinding
  );
});

Cypress.Commands.add("addAddress", (managementEndpoint, address, parameters) => {
  return cy.task("execute:cli", {
    managementApi: `${managementEndpoint}/management`,
    operation: "add",
    address: address,
    ...parameters,
  });
});

Cypress.Commands.add("addAddressIfDoesntExist", (managementEndpoint, address, parameters) => {
  return cy
    .task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "validate-address",
      value: address,
    })
    .then((result) => {
      expect((result as { outcome: string }).outcome).to.equal("success");
      if (!(result as { result: { valid: boolean } }).result.valid) {
        cy.task("execute:cli", {
          managementApi: managementEndpoint + "/management",
          operation: "add",
          address: address,
          ...parameters,
        });
      }
    });
});

Cypress.Commands.add("removeAddressIfExists", (managementEndpoint, address) => {
  cy.task("execute:cli", {
    managementApi: managementEndpoint + "/management",
    operation: "validate-address",
    value: address,
  }).then((result) => {
    expect((result as { outcome: string }).outcome).to.equal("success");
    if ((result as { result: { valid: boolean } }).result.valid) {
      cy.task("execute:cli", {
        managementApi: managementEndpoint + "/management",
        operation: "remove",
        address: address,
      });
    }
  });
});

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      createMailSession(
        managementEndpoint: string,
        mailSession: {
          mailSessionName: string;
          jndiName: string;
        }
      ): Chainable<void>;
      createOutboundSocketBinding(
        managementEndpoint: string,
        outBoundSocketBinding: {
          name: string;
          host: string;
          port: string;
        }
      ): Chainable<void>;
      addAddress(managementEndpoint: string, address: string[], parameters?: object): Chainable<unknown>;
      addAddressIfDoesntExist(managementEndpoint: string, address: string[], parameters?: object): Chainable<unknown>;
      removeAddressIfExists(managementEndpoint: string, address: string[]): void;
    }
  }
}
