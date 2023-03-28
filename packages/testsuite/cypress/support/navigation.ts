/// <reference types="cypress" />

Cypress.Commands.add("navigateTo", (managementEndpoint, subsystem) => {
  cy.visit(`?connect=${managementEndpoint}#${subsystem}`);
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
      /**
       * Load a subsystem page
       * @category Navigation
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param subsystem - The name after the # in URL address.
       */
      navigateTo(managementEndpoint: string, subsystem: string): Chainable<void>;
      /**
       * Load a subsystem page
       * @category Navigation
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - key words from URL parameter "address". e.g. "subsystem" and "health"
       */
      navigateToGenericSubsystemPage(managementEndpoint: string, address: string[]): Chainable<void>;
      /**
       * Select resource in table.
       * @category Navigation
       *
       * @param tableId - The ID of table where need to be added a new resource.
       * @param resourceName - The name of a resource from table.
       */
      selectInTable(tableId: string, resourceName: string): void;
      /**
       * Confirm the add resource dialog
       * @category Navigation
       */
      confirmAddResourceWizard(): void;
    }
  }
}
