/// <reference types="cypress" />

Cypress.Commands.add("navigateTo", (managementEndpoint, token) => {
  cy.visit(`?connect=${managementEndpoint}#${token}`);
  cy.get("#hal-root-container").should("be.visible");
});

Cypress.Commands.add("navigateToGenericSubsystemPage", (managementEndpoint, address) => {
  const subsystemSeparator = "%255C2";
  cy.visit(`?connect=${managementEndpoint}#generic-subsystem;address=%255C0${address.join(subsystemSeparator)}`);
  cy.get("#hal-root-container").should("be.visible");
});

Cypress.Commands.add("selectInTable", (tableId, resourceName) => {
  const tableWrapper = `#${tableId}_wrapper`;
  cy.get(`${tableWrapper} td:contains("${resourceName}")`).click();
});

Cypress.Commands.add("confirmAddResourceWizard", () => {
  cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")').click({ force: true });
});

export {};
/* eslint @typescript-eslint/no-namespace: off */
declare global {
  namespace Cypress {
    interface Chainable {
      navigateTo(managementEndpoint: string, token: string): Chainable<void>;
      navigateToGenericSubsystemPage(managementEndpoint: string, address: string[]): Chainable<void>;
      selectInTable(tableId: string, resourceName: string): void;
      confirmAddResourceWizard(): void;
    }
  }
}
