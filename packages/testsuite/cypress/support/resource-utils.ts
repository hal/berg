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

Cypress.Commands.add("formInput", (configurationFormId, attributeName) => {
  return cy.get("#" + configurationFormId + "-" + attributeName + "-editing");
});

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Create a mail session.
       * @category Specific resource
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param mailSession - The object must contain:
       */
      createMailSession(
        managementEndpoint: string,
        mailSession: {
          mailSessionName: string;
          jndiName: string;
        }
      ): Chainable<void>;
      /**
       * Create a outbound socket binding.
       * @category Specific resource
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param outBoundSocketBinding - The object must contain:
       */
      createOutboundSocketBinding(
        managementEndpoint: string,
        outBoundSocketBinding: {
          name: string;
          host: string;
          port: string;
        }
      ): Chainable<void>;
      /**
       * Create a generic resource. The resource can't exist otherwise it fail.
       * @category Generic resource
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - CLI address of subsystem where need to be added a new resource.
       * @param parameters - if is used can specify all details of new resource.
       */
      addAddress(managementEndpoint: string, address: string[], parameters?: object): Chainable<unknown>;
      /**
       * Check if the resource exist if not then create it.
       * @category Generic resource
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - CLI address of subsystem where need to be added a new resource.
       * @param parameters - if is used can specify all details of new resource.
       */
      addAddressIfDoesntExist(managementEndpoint: string, address: string[], parameters?: object): Chainable<unknown>;
      /**
       * if the resource exist remove it.
       * @category Generic resource
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - CLI address of subsystem which will be removed.
       */
      removeAddressIfExists(managementEndpoint: string, address: string[]): void;
      /**
       * Load via CLI saved configuration value.
       * @category Get value
       *
       * @param managementEndpoint - Host name of currently used container.
       * @param address - CLI address of subsystem.
       * @param name - name of attribute from subsystem configuration.
       *
       * @returns The the attribute value of subsystem configuration.
       */
      getDefaultBooleanValue(managementEndpoint: string, address: string[], name: string): Chainable<boolean>;
      /**
       * Get HTML element from form.
       * @category Get value
       *
       * @param configurationFormId - The ID of section with the form input.
       * @param attributeName - name of form input.
       *
       * @returns The selected form input.
       */

      formInput(configurationFormId: string, attributeName: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}
