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
  cy.intercept("POST", "https://www.google-analytics.com/j/collect*").as(
    "loadPage"
  );
  cy.visit(`?connect=${managementEndpoint}#${token}`);
  cy.wait("@loadPage").its("response.statusCode").should("eq", 200);
  cy.get("#hal-root-container").should("be.visible");
});

Cypress.Commands.add(
  "navigateToGenericSubsystemPage",
  (managementEndpoint, address) => {
    const subsystemSeparator = "%255C2";
    cy.intercept("POST", "https://www.google-analytics.com/j/collect*").as(
      "loadPage"
    );
    cy.visit(
      `?connect=${managementEndpoint}#generic-subsystem;address=%255C0${address.join(
        subsystemSeparator
      )}`
    );
    cy.wait("@loadPage").its("response.statusCode").should("eq", 200);
    cy.get("#hal-root-container").should("be.visible");
  }
);

Cypress.Commands.add("editForm", (configurationFormId) => {
  const editButton =
    "#" + configurationFormId + ' a.clickable[data-operation="edit"';
  cy.get(`#${configurationFormId}-editing`).should("not.be.visible");
  cy.get(editButton).click();
  cy.get(`#${configurationFormId}-editing`).should("be.visible");
});

Cypress.Commands.add("saveForm", (configurationFormId) => {
  const saveButton =
    "#" +
    configurationFormId +
    '-editing button.btn.btn-hal.btn-primary:contains("Save")';
  cy.get(saveButton).scrollIntoView().click();
});

Cypress.Commands.add("formInput", (configurationFormId, attributeName) => {
  return cy.get("#" + configurationFormId + "-" + attributeName + "-editing");
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
      '-editing"] .bootstrap-switch-label'
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

Cypress.Commands.add(
  "resetForm",
  (configurationFormId, managementApi, address) => {
    const resetButton =
      "#" + configurationFormId + ' a.clickable[data-operation="reset"';
    cy.get(resetButton).click();
    cy.get(".modal-footer .btn-primary").click({ force: true });
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
        .filter((key: string) =>
          Object.prototype.hasOwnProperty.call(attributes[key], "default")
        )
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
          expect(
            (result as { result: string | number | boolean }).result
          ).to.equal(attributeWithDefaultValue.defaultValue);
        });
      });
    });
  }
);

Cypress.Commands.add("addInTable", (tableId) => {
  const tableWrapper = `#${tableId}_wrapper`;
  cy.get(
    `${tableWrapper} button.btn.btn-default > span:contains("Add")`
  ).click();
});

Cypress.Commands.add("selectInTable", (tableId, resourceName) => {
  const tableWrapper = `#${tableId}_wrapper`;
  cy.get(`${tableWrapper} td:contains("${resourceName}")`).click();
});

Cypress.Commands.add("removeFromTable", (tableId, resourceName) => {
  const tableWrapper = `#${tableId}_wrapper`;
  cy.selectInTable(tableId, resourceName);
  cy.get(
    `${tableWrapper} button.btn.btn-default > span:contains("Remove")`
  ).click();
  cy.get(
    'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")'
  ).click();
});

Cypress.Commands.add("text", (configurationFormId, attributeName, value) => {
  cy.clearAttribute(configurationFormId, attributeName);
  cy.formInput(configurationFormId, attributeName).click({force: true}).type(value);
  cy.formInput(configurationFormId, attributeName).should("have.value", value);
  cy.formInput(configurationFormId, attributeName).trigger("change");
});

Cypress.Commands.add("clearAttribute", (configurationFormId, attributeName) => {
  cy.formInput(configurationFormId, attributeName).click({force: true}).clear();
  cy.formInput(configurationFormId, attributeName).should("have.value", "");
  cy.formInput(configurationFormId, attributeName).trigger("change");
});

Cypress.Commands.add("verifySuccess", () => {
  cy.get(".toast-notifications-list-pf .alert-success").should("be.visible");
});

Cypress.Commands.add("startWildflyContainer", () => {
  return cy.task("start:wildfly:container", {
    name: Cypress.spec.name.replace(/\.cy\.ts/g, "").replace(/-/g, "_"),
  });
});

Cypress.Commands.add("executeInWildflyContainer", (command) => {
  return cy.task("execute:in:container", {
    containerName: Cypress.spec.name
      .replace(/\.cy\.ts/g, "")
      .replace(/-/g, "_"),
    command: command,
  });
});

Cypress.Commands.add(
  "addAddress",
  (managementEndpoint, address, parameters) => {
    return cy.task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "add",
      address: address,
      ...parameters,
    });
  }
);

Cypress.Commands.add(
  "addAddressIfDoesntExist",
  (managementEndpoint, address, parameters) => {
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
  }
);

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

Cypress.Commands.add(
  "validateAddress",
  (managementEndpoint, address, expectedValue) => {
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "validate-address",
      value: address,
    }).then((result) => {
      expect((result as { outcome: string }).outcome).to.equal("success");
      expect((result as { result: { valid: boolean } }).result.valid).to.equal(
        expectedValue
      );
    });
  }
);

Cypress.Commands.add(
  "verifyAttribute",
  (managementEndpoint, address, attributeName, expectedValue) => {
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: attributeName,
    }).then((result) => {
      expect((result as { outcome: string }).outcome).to.equal("success");
      expect((result as { result: string | number | boolean }).result).to.equal(
        expectedValue
      );
    });
  }
);

Cypress.Commands.add(
  "verifyListAttributeContains",
  (managementEndpoint, address, attributeName, expectedValue) => {
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: address,
      name: attributeName,
    }).then((result) => {
      expect((result as { outcome: string }).outcome).to.equal("success");
      expect(
        (result as { result: object[] | string[] }).result
      ).to.deep.include(expectedValue);
    });
  }
);

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
      expect(
        (result as { result: object[] | string[] }).result
      ).to.not.deep.include(expectedValue);
    });
  }
);

export {};
/* eslint @typescript-eslint/no-namespace: off */
declare global {
  namespace Cypress {
    interface Chainable {
      flip(
        configurationFormId: string,
        attributeName: string,
        value: boolean
      ): Chainable<void>;
      text(
        configurationFormId: string,
        attributeName: string,
        value: string
      ): Chainable<void>;
      clearAttribute(
        configurationFormId: string,
        attributeName: string
      ): Chainable<void>;
      editForm(configurationFormId: string): Chainable<void>;
      formInput(
        configurationFormId: string,
        attributeName: string
      ): Chainable<JQuery<HTMLElement>>;
      saveForm(configurationFormId: string): Chainable<void>;
      resetForm(
        configurationFormId: string,
        managementApi: string,
        address: string[]
      ): Chainable<void>;
      navigateTo(managementEndpoint: string, token: string): Chainable<void>;
      navigateToGenericSubsystemPage(
        managementEndpoint: string,
        address: string[]
      ): Chainable<void>;
      verifySuccess(): Chainable<void>;
      startWildflyContainer(): Chainable<unknown>;
      executeInWildflyContainer(command: string): Chainable<unknown>;
      addAddress(
        managementEndpoint: string,
        address: string[],
        parameters?: object
      ): Chainable<unknown>;
      addAddressIfDoesntExist(
        managementEndpoint: string,
        address: string[],
        parameters?: object
      ): Chainable<unknown>;
      removeAddressIfExists(
        managementEndpoint: string,
        address: string[]
      ): void;
      validateAddress(
        managementEndpoint: string,
        address: string[],
        expectedValue: boolean
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
      addInTable(tableId: string): void;
      selectInTable(tableId: string, resourceName: string): void;
      removeFromTable(tableId: string, resourceName: string): void;
    }
  }
}
