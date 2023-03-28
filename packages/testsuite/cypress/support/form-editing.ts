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

Cypress.Commands.add("navigateTo", (managementEndpoint, token) => {
  cy.visit(`?connect=${managementEndpoint}#${token}`);
  cy.get("#hal-root-container").should("be.visible");
});

Cypress.Commands.add("navigateToGenericSubsystemPage", (managementEndpoint, address) => {
  const subsystemSeparator = "%255C2";
  cy.visit(`?connect=${managementEndpoint}#generic-subsystem;address=%255C0${address.join(subsystemSeparator)}`);
  cy.get("#hal-root-container").should("be.visible");
});

Cypress.Commands.add("editForm", (configurationFormId) => {
  const editButton = "#" + configurationFormId + ' a.clickable[data-operation="edit"';
  cy.get(`#${configurationFormId}-editing`).should("not.be.visible");
  cy.get(editButton).click();
  cy.get(`#${configurationFormId}-editing`).should("be.visible");
});

Cypress.Commands.add("saveForm", (configurationFormId) => {
  const saveButton = "#" + configurationFormId + '-editing button.btn.btn-hal.btn-primary:contains("Save")';
  cy.get(saveButton).scrollIntoView().click();
});

/* eslint @typescript-eslint/unbound-method: off */
Cypress.Commands.add("flip", (configurationFormId, attributeName, value) => {
  cy.formInput(configurationFormId, attributeName)
    .wait(1000)
    .should(($input) => {
      if (value) {
        expect($input).to.be.checked;
      } else {
        expect($input).to.not.be.checked;
      }
    });
  cy.get(
    'div[data-form-item-group="' +
      configurationFormId +
      "-" +
      attributeName +
      '-editing"] .bootstrap-switch-label:visible'
  )
    .click()
    .wait(1000);
  cy.formInput(configurationFormId, attributeName).should(($input) => {
    if (value) {
      expect($input).to.not.be.checked;
    } else {
      expect($input).to.be.checked;
    }
  });
});

Cypress.Commands.add("resetForm", (configurationFormId, managementApi, address) => {
  const resetButton = "#" + configurationFormId + ' a.clickable[data-operation="reset"';
  cy.get(resetButton).click();
  cy.get(".modal-footer .btn-hal.btn-primary").click({ force: true });
  cy.verifySuccess();
  cy.task("execute:cli", {
    managementApi: `${managementApi}/management`,
    operation: "read-resource-description",
    address: address,
  }).then((result) => {
    expect((result as { outcome: string }).outcome).to.equal("success");
    const attributes = (
      result as {
        result: { attributes: { [key: string]: { default?: string } } };
      }
    ).result.attributes;
    const attributesWithDefaultValues = Object.keys(attributes)
      .filter((key: string) => Object.prototype.hasOwnProperty.call(attributes[key], "default"))
      .map((key) => {
        const obj: {
          [index: string]: undefined | string | number | boolean;
        } = {};
        obj["name"] = key;
        obj["defaultValue"] = attributes[key].default;
        return obj;
      });
    attributesWithDefaultValues.forEach((attributeWithDefaultValue) => {
      cy.task("execute:cli", {
        managementApi: `${managementApi}/management`,
        operation: "read-attribute",
        address: address,
        name: attributeWithDefaultValue.name,
      }).then((result) => {
        expect((result as { outcome: string }).outcome).to.equal("success");
        expect((result as { result: string | number | boolean }).result).to.equal(
          attributeWithDefaultValue.defaultValue
        );
      });
    });
  });
});

Cypress.Commands.add("addInTable", (tableId) => {
  const tableWrapper = `#${tableId}_wrapper`;
  cy.get(`${tableWrapper} button.btn.btn-default > span:contains("Add")`).click();
});

Cypress.Commands.add("selectInTable", (tableId, resourceName) => {
  const tableWrapper = `#${tableId}_wrapper`;
  cy.get(`${tableWrapper} td:contains("${resourceName}")`).click();
});

Cypress.Commands.add("removeFromTable", (tableId, resourceName) => {
  const tableWrapper = `#${tableId}_wrapper`;
  cy.selectInTable(tableId, resourceName);
  cy.get(`${tableWrapper} button.btn.btn-default > span:contains("Remove")`).click();
  cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click();
});

Cypress.Commands.add("text", (configurationFormId, attributeName, value) => {
  cy.formInput(configurationFormId, attributeName).click({ force: true }).wait(200).clear();
  cy.formInput(configurationFormId, attributeName).type(value);
  cy.formInput(configurationFormId, attributeName).should("have.value", value);
  cy.formInput(configurationFormId, attributeName).trigger("change");
});

Cypress.Commands.add("clearAttribute", (configurationFormId, attributeName) => {
  cy.formInput(configurationFormId, attributeName).click({ force: true }).wait(200).clear();
  cy.formInput(configurationFormId, attributeName).should("have.value", "");
  cy.formInput(configurationFormId, attributeName).trigger("change");
});

Cypress.Commands.add("confirmAddResourceWizard", () => {
  cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")').click({ force: true });
});

Cypress.Commands.add("addSingletonResource", (emptyConfigurationFormId) => {
  cy.get("#" + emptyConfigurationFormId + ' .btn-primary:contains("Add")').click();
});

Cypress.Commands.add("removeSingletonResource", (configurationFormId) => {
  const removeButton = "#" + configurationFormId + ' a.clickable[data-operation="remove"';
  cy.get(removeButton).click();
  cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click();
});

export {};
/* eslint @typescript-eslint/no-namespace: off */
declare global {
  namespace Cypress {
    interface Chainable {
      editForm(configurationFormId: string): Chainable<void>;
      saveForm(configurationFormId: string): Chainable<void>;
      resetForm(configurationFormId: string, managementApi: string, address: string[]): Chainable<void>;

      addInTable(tableId: string): void;
      removeFromTable(tableId: string, resourceName: string): void;

      addSingletonResource(emptyConfigurationFormId: string): void;
      removeSingletonResource(configurationFormId: string): void;

      flip(configurationFormId: string, attributeName: string, value: boolean): Chainable<void>;
      text(configurationFormId: string, attributeName: string, value: string): Chainable<void>;
      clearAttribute(configurationFormId: string, attributeName: string): Chainable<void>;
    }
  }
}
