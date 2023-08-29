Cypress.Commands.add("navigateTo", (managementEndpoint, subsystem) => {
  cy.visit(`?connect=${managementEndpoint}#${subsystem}`);
  cy.get("#hal-root-container").should("be.visible");
});

Cypress.Commands.add("navigateToGenericSubsystemPage", (managementEndpoint, address) => {
  const subsystemSeparator = "%255C2";
  cy.visit(`?connect=${managementEndpoint}#generic-subsystem;address=%255C0${address.join(subsystemSeparator)}`);
  cy.get("#hal-root-container").should("be.visible");
});

Cypress.Commands.add("navigateToSpecificChannel", (managementEndpoint, channel) => {
  cy.visit(`?connect=${managementEndpoint}#channel;name=${channel}`);
  cy.get("#hal-root-container").should("be.visible");
});

Cypress.Commands.add("selectInTable", (tableId, resourceName) => {
  const tableWrapper = `#${tableId}_wrapper`;
  cy.get(`${tableWrapper} td:contains("${resourceName}")`).click();
});

Cypress.Commands.add("confirmAddResourceWizard", () => {
  cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")').click({ force: true });
});

Cypress.Commands.add("closeWizard", () => {
  cy.get("div.modal-header > button.close >").click({ force: true, multiple: true });
});

Cypress.Commands.add("confirmNextInWizard", () => {
  cy.get('div.modal-footer > button.btn.btn-primary:contains("Next")').click({ force: true });
});

Cypress.Commands.add("confirmFinishInWizard", () => {
  cy.get('div.modal-footer > button.btn.btn-primary:contains("Finish")').click({ force: true });
});

Cypress.Commands.add("navigateToUpdateManagerPage", (managementEndpoint, address) => {
  const subsystemSeparator = "~";
  cy.visit(`?connect=${managementEndpoint}#update-manager;path=${address.join(subsystemSeparator)}`);
  cy.get("#hal-root-container").should("be.visible");
});

Cypress.Commands.add("logoutFromWebConsole", () => {
  cy.get("#header-username").parents("a").click();
  cy.get("#logout-link").click();
});

Cypress.Commands.add("confirmYesInWizard", () => {
  cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click();
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
       * Load a channel page
       * @category Navigation
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param channel - The name of channel.
       */
      navigateToSpecificChannel(managementEndpoint: string, channel: string): Chainable<void>;
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
      /**
       * Confirm the next resource dialog
       * @category Navigation
       */
      closeWizard(): void;
      /**
       * Close the dialog
       * @category Navigation
       */
      confirmNextInWizard(): void;
      /**
       * Confirm the finish resource dialog
       * @category Navigation
       */
      confirmFinishInWizard(): void;
      /**
       * Load a Update Manager page
       * @category Navigation
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - key words from URL parameter "address". e.g. "update-manager" and "updates"
       */
      navigateToUpdateManagerPage(managementEndpoint: string, address: string[]): Chainable<void>;
      /**
       * Logout from console. Click on profile and then logout button.
       * @category Navigation
       */
      logoutFromWebConsole(): void;
      /**
       * Confirm modal dialog by click on "YES" button
       * @category Navigation
       */
      confirmYesInWizard(): void;
    }
  }
}
