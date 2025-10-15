Cypress.Commands.add("verifySuccess", () => {
  cy.get(".toast-notifications-list-pf .alert-success").should("be.visible");
});

Cypress.Commands.add("verifyElementHasClass", (formId, attributeName, elementName, className) => {
  cy.formInput(formId, attributeName)
    .get(elementName + "." + className)
    .should("exist");
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
  },
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

Cypress.Commands.add("verifyRemovedFromTable", (tableId, resourceName) => {
  const tableWrapper = `#${tableId}_wrapper`;
  cy.get(`${tableWrapper} td:contains("${resourceName}")`).should("not.exist");
});

Cypress.Commands.add("verifyAttributeAsExpression", (managementEndpoint, address, attributeName, expectedValue) => {
  cy.readAttributeAsExpression(managementEndpoint, address, attributeName).then((result) => {
    expect(result).to.equal(expectedValue);
  });
});

Cypress.Commands.add("verifyErrorMessage", (errorMessageText) => {
  cy.get("div.alert.alert-danger.margin-top-large > span:nth-child(2)").should("have.text", errorMessageText);
});

Cypress.Commands.add("verifyUserName", (expectedUserName) => {
  cy.get("#header-username").should("have.text", expectedUserName);
});

Cypress.Commands.add("verifyUserRole", (expectedRoleName) => {
  cy.get(".active-roles").should(($roles) => {
    expect($roles.attr(`title`)).contains(expectedRoleName);
  });
});

Cypress.Commands.add("closeAllPopUpNotifications", () => {
  if (Cypress.$(".alert.alert-dismissable").length > 0) {
    cy.get(".alert.alert-dismissable").each(($popupNotification) => {
      $popupNotification.find(".close").trigger("click");
    });
  }
});

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Verify the "Success" popup notification was displayed.
       * @category Verification
       */
      verifySuccess(): Chainable<void>;
      /**
       * Verify the specified HTML element has a specified class.
       * @category Verification
       *
       * @param configurationFormId - The ID of section with the form input.
       * @param attributeName - name of form input.
       * @param elementName - Name of HTML element
       * @param className - Name of class that has to be presented in the HTML element
       */
      verifyElementHasClass(
        formId: string,
        attributeName: string,
        elementName: string,
        className: string,
      ): Chainable<void>;
      /**
       * Verify the specific configuration is saved.
       * @category Verification
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - CLI address of subsystem which needs to be verified.
       * @param attributeName - Attribute of subsystem which needs to be verified.
       * @param expectedValue - The expected value of the attribute.
       */
      verifyAttribute(
        managementEndpoint: string,
        address: string[],
        attributeName: string,
        expectedValue: string | number | boolean,
      ): void;
      /**
       * Verify a list attribute contain expected value.
       * @category Verification
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - CLI address of subsystem which needs to be verified.
       * @param attributeName - Attribute of subsystem which needs to be verified.
       * @param expectedValue - The expected value must be in a list.
       */
      verifyListAttributeContains(
        managementEndpoint: string,
        address: string[],
        attributeName: string,
        expectedValue: object | string,
      ): void;
      /**
       * Verify a list attribute contain expected value.
       * @category Verification
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - CLI address of subsystem which needs to be verified.
       * @param attributeName - Attribute of subsystem which needs to be verified.
       * @param expectedValue - The expected value can not be in a list.
       */
      verifyListAttributeDoesNotContain(
        managementEndpoint: string,
        address: string[],
        attributeName: string,
        expectedValue: object | string,
      ): void;
      /**
       * Verify a subsystem configuration was created or removed.
       * @category Verification
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - CLI address of subsystem which needs to be verified.
       * @param expectedValue - The "true" if subsystem configuration should exist and "false" if not.
       */
      validateAddress(managementEndpoint: string, address: string[], expectedValue: boolean): void;
      /**
       * Select resource from table and click on "Remove" to delete the resource.
       * @category Verification
       *
       * @param tableId - The ID of table where should not be a resource
       * @param resourceName - The name of a resource
       */
      verifyRemovedFromTable(tableId: string, resourceName: string): void;

      /**
       * Verify the specific configuration is saved.
       * @category Verification
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - CLI address of subsystem which needs to be verified.
       * @param attributeName - Attribute of subsystem which needs to be verified.
       * @param expectedValue - The expected value of the attribute. The value is expected to be an expression
       */
      verifyAttributeAsExpression(
        managementEndpoint: string,
        address: string[],
        attributeName: string,
        expectedValue: string,
      ): void;
      /**
       * Verify the forbiden error message is displayd
       * @category Verification
       */
      verifyErrorMessage(errorMessageText: string): void;
      /**
       * Verify the name of logged user
       *
       * @param expectedUserName expected name of user
       */
      verifyUserName(expectedUserName: string): void;
      /**
       * Verify a user have assigned roles
       *
       * @param expectedRoleName expected roles
       */
      verifyUserRole(expectedRoleName: string): void;

      /**
       * Close all pop-up notifications
       */
      closeAllPopUpNotifications(): void;
    }
  }
}
