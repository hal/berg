import { AddModuleCommandBuilder } from "@hal/commands";

describe("TESTS: Configuration => Subsystem => Subsystem => Core Management => Process State Listener", () => {
  const processStateListenerTableId = "core-mgmt-prc-state-table";
  const processStateListenerModuleName = "org.jboss.hal.cypress.resources";
  const processStateListenerClass =
    "org.jboss.hal.cypress.resources.SimpleProcessStateListener";

  let managementEndpoint: string;

  const processStateListeners = {
    create: {
      name: "process-state-listener-to-add",
      class: processStateListenerClass,
      module: processStateListenerModuleName,
    },
    delete: {
      name: "process-state-listener-to-delete",
      class: processStateListenerClass,
      module: processStateListenerModuleName,
    },
  };

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.executeInWildflyContainer(
        new AddModuleCommandBuilder()
          .withName(processStateListenerModuleName)
          .withResource(
            "/home/fixtures/modules/process-state-listener-1.0-SNAPSHOT.jar"
          )
          .withDependencies(["org.wildfly.extension.core-management-client"])
          .build()
          .toCLICommand()
      ).then(() => {
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "core-management",
            "process-state-listener",
            processStateListeners.delete.name,
          ],
          {
            class: processStateListeners.delete.class,
            module: processStateListeners.delete.module,
          }
        );
      });
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Process State Listener", () => {
    cy.navigateTo(managementEndpoint, "core-management");
    cy.get("#core-mgmt-prc-state-item").click();
    cy.addInTable(processStateListenerTableId);
    cy.text(
      "core-mgmt-prc-state-table-add",
      "name",
      processStateListeners.create.name
    );
    cy.text(
      "core-mgmt-prc-state-table-add",
      "class",
      processStateListeners.create.class
    );
    cy.text(
      "core-mgmt-prc-state-table-add",
      "module",
      processStateListeners.create.module
    );
    cy.get(
      'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")'
    ).click();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "core-management",
        "process-state-listener",
        processStateListeners.create.name,
      ],
      true
    );
  });

  it("Delete Process State Listener", () => {
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "core-management",
        "process-state-listener",
        processStateListeners.delete.name,
      ],
      true
    );
    cy.navigateTo(managementEndpoint, "core-management");
    cy.get("#core-mgmt-prc-state-item").click();
    cy.removeFromTable(
      processStateListenerTableId,
      processStateListeners.delete.name
    );
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "core-management",
        "process-state-listener",
        processStateListeners.delete.name,
      ],
      false
    );
  });
});
