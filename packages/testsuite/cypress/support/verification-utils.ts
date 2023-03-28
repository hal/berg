/// <reference types="cypress" />

Cypress.Commands.add("verifySuccess", () => {
  cy.get(".toast-notifications-list-pf .alert-success").should("be.visible");
});

Cypress.Commands.add("verifyAttribute", (managementEndpoint, address, attributeName, expectedValue) => {
  cy.task("execute:cli", {
    managementApi: managementEndpoint + "/management",
    operation: "read-attribute",
    address: address,
    name: attributeName,
  }).then((result) => {
    expect((result as { outcome: string }).outcome).to.equal("success");
    expect((result as { result: string | number | boolean }).result).to.equal(expectedValue);
  });
});

Cypress.Commands.add("verifyListAttributeContains", (managementEndpoint, address, attributeName, expectedValue) => {
  cy.task("execute:cli", {
    managementApi: managementEndpoint + "/management",
    operation: "read-attribute",
    address: address,
    name: attributeName,
  }).then((result) => {
    expect((result as { outcome: string }).outcome).to.equal("success");
    expect((result as { result: object[] | string[] }).result).to.deep.include(expectedValue);
  });
});

Cypress.Commands.add(
  "verifyListAttributeDoesNotContain",
  (managementEndpoint, address, attributeName, expectedValue) => {
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: attributeName,
    }).then((result) => {
      expect((result as { outcome: string }).outcome).to.equal("success");
      expect((result as { result: object[] | string[] }).result).to.not.deep.include(expectedValue);
    });
  }
);

Cypress.Commands.add("validateAddress", (managementEndpoint, address, expectedValue) => {
  cy.task("execute:cli", {
    managementApi: managementEndpoint + "/management",
    operation: "validate-address",
    value: address,
  }).then((result) => {
    expect((result as { outcome: string }).outcome).to.equal("success");
    expect((result as { result: { valid: boolean } }).result.valid).to.equal(expectedValue);
  });
});

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      verifySuccess(): Chainable<void>;
      verifyAttribute(
        managementEndpoint: string,
        address: string[],
        attributeName: string,
        expectedVaue: string | number | boolean
      ): void;
      verifyAttribute(
        managementEndpoint: string,
        address: string[],
        attributeName: string,
        expectedVaue: string | number | boolean
      ): void;
      verifyListAttributeContains(
        managementEndpoint: string,
        address: string[],
        attributeName: string,
        expectedVaue: object | string
      ): void;
      verifyListAttributeDoesNotContain(
        managementEndpoint: string,
        address: string[],
        attributeName: string,
        expectedVaue: object | string
      ): void;
      validateAddress(managementEndpoint: string, address: string[], expectedValue: boolean): void;
    }
  }
}
