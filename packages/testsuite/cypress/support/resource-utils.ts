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

Cypress.Commands.add("readAttributeAsBoolean", (managementEndpoint, address, name) => {
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

Cypress.Commands.add("readAttributeAsObject", (managementEndpoint, address, name) => {
  return cy
    .task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: address,
      name: name,
    })
    .then((result) => {
      return (result as { result: object }).result;
    });
});

Cypress.Commands.add("readAttributeAsNumber", (managementEndpoint, address, name) => {
  return cy
    .task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: address,
      name: name,
    })
    .then((result) => {
      return (result as { result: number }).result;
    });
});

Cypress.Commands.add("readAttributeAsString", (managementEndpoint, address, name) => {
  return cy
    .task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: address,
      name: name,
    })
    .then((result) => {
      return (result as { result: string }).result;
    });
});

Cypress.Commands.add("readAttributeAsObjectList", (managementEndpoint, address, name) => {
  return cy
    .task("execute:cli", {
      managementApi: `${managementEndpoint}/management`,
      operation: "read-attribute",
      address: address,
      name: name,
    })
    .then((result) => {
      return (result as { result: object[] }).result;
    });
});

Cypress.Commands.add("writeAttribute", (managementEndpoint, address, name, value) => {
  cy.task("execute:cli", {
    managementApi: managementEndpoint + "/management",
    operation: "write-attribute",
    address: address,
    name: name,
    value: value,
  });
});

Cypress.Commands.add("formInput", (configurationFormId, attributeName) => {
  return cy.get("#" + configurationFormId + "-" + attributeName + "-editing");
});

Cypress.Commands.add("isEAP", (managementEndpoint) => {
  return cy.readAttributeAsString(managementEndpoint, [], "product-name").then((productName) => {
    return productName.includes("EAP");
  });
});

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Create a mail session.
       * @category Specific resource
       *
       * @param managementEndpoint - Management endpoint of the WildFly server instance.
       * @param mailSession - Mail Session object to be created. This object must contain "mailSessionName" and "jndiName" properties.
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
       * @param managementEndpoint - Management endpoint of the WildFly server instance.
       * @param outBoundSocketBinding - Outbound Socket Binding object to be created. This object must contain: "name", "host" and "port" properties.
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
       * @param managementEndpoint - Management endpoint of the WildFly server container instance.
       * @param address - CLI address of subsystem where need to be added a new resource.
       * @param parameters - if is used can specify all details of new resource.
       */
      addAddress(managementEndpoint: string, address: string[], parameters?: object): Chainable<unknown>;
      /**
       * Check if the resource exist if not then create it.
       * @category Generic resource
       *
       * @param managementEndpoint - Management endpoint of the WildFly server container instance.
       * @param address - CLI address of subsystem where need to be added a new resource.
       * @param parameters - if is used can specify all details of new resource.
       */
      addAddressIfDoesntExist(managementEndpoint: string, address: string[], parameters?: object): Chainable<unknown>;
      /**
       * if the resource exist remove it.
       * @category Generic resource
       *
       * @param managementEndpoint - Management endpoint of the WildFly server container instance.
       * @param address - CLI address of subsystem which will be removed.
       */
      removeAddressIfExists(managementEndpoint: string, address: string[]): void;
      /**
       * Executes :read-attribute operation at given address and attribute name.
       * Returns read value as boolean
       * @category Get value
       *
       * @param managementEndpoint - Management endpoint of the WildFly server container instance.
       * @param address - CLI address of subsystem.
       * @param name - name of attribute from subsystem configuration.
       *
       * @returns The the attribute value of subsystem configuration as a boolean.
       */
      readAttributeAsBoolean(managementEndpoint: string, address: string[], name: string): Chainable<boolean>;
      /**
       * Executes :read-attribute operation at given address and attribute name.
       * Returns read value as object. Until further types development is ready,
       * the user is responsible for type casting safety of the returned object.
       * @category Get value
       *
       * @param managementEndpoint - Management endpoint of the WildFly server container instance.
       * @param address - CLI address of subsystem.
       * @param name - name of attribute from subsystem configuration.
       *
       * @returns The the attribute value of subsystem configuration as generic object.
       */
      readAttributeAsObject(managementEndpoint: string, address: string[], name: string): Chainable<object>;
      /**
       * Executes :read-attribute operation at given address and attribute name.
       * Returns read value as number.
       *
       * @param managementEndpoint - Management endpoint of the WildFly server container instance.
       * @param address - CLI address of subsystem.
       * @param name - name of attribute from subsystem configuration.
       *
       * @returns The the attribute value of subsystem configuration as number.
       */
      readAttributeAsNumber(managementEndpoint: string, address: string[], name: string): Chainable<number>;
      /**
       * Executes :read-attribute operation at given address and attribute name.
       * Returns read value as string.
       *
       * @param managementEndpoint - Management endpoint of the WildFly server container instance.
       * @param address - CLI address of subsystem.
       * @param name - name of attribute from subsystem configuration.
       *
       * @returns The the attribute value of subsystem configuration as string.
       */
      readAttributeAsString(managementEndpoint: string, address: string[], name: string): Chainable<string>;

      /**
       * Executes :read-attribute operation at given address and attribute name.
       * Returns read value as object list. Until further types development is ready,
       * the user is responsible for type casting safety of the returned object list.
       * @category Get value
       *
       * @param managementEndpoint - Management endpoint of the WildFly server container instance.
       * @param address - CLI address of subsystem.
       * @param name - name of attribute from subsystem configuration.
       *
       * @returns The the attribute value of subsystem configuration as generic object.
       */
      readAttributeAsObjectList(managementEndpoint: string, address: string[], name: string): Chainable<object[]>;
      /**
       *
       * @param managementEndpoint - Management endpoint of the WildFly server container instance.
       * @param address - CLI address of subsystem.
       * @param name - name of attribute from subsystem configuration.
       * @param value - value to be set to the attribute
       */
      writeAttribute(
        managementEndpoint: string,
        address: string[],
        name: string,
        value: string | boolean | number
      ): Chainable<object[]>;
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

      /**
       * Executes :read-attribute(name=product-name) at the root address and determines, whether the
       * running WildFly server instance is WildFly/EAP
       * @category Get value
       * @param managementEndpoint - Management endpoint of the WildFly server container instance.
       * @returns true if the running server instance is EAP
       */
      isEAP(managementEndpoint: string): Chainable<boolean>;
    }
  }
}
