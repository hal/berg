describe("TESTS: Configuration => Subsystem => EE => Services => Context Service", () => {
  let managementEndpoint: string;

  const configurationFormId = "ee-service-context-service-form";
  const contextServicesTable = "ee-service-context-service-table";

  const contextServices = {
    create: {
      name: "context-service-to-add",
      "jndi-name": "java:jboss/jndiToAdd",
    },
    update: {
      name: "context-service-to-update",
      "jndi-name": "java:jboss/jndiToUpdate",
    },
    remove: {
      name: "context-service-to-remove",
      "jndi-name": "java:jboss/jndiToRemove",
    },
    reset: {
      name: "context-service-to-reset",
      "jndi-name": "java:jboss/jndiToReset",
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(managementEndpoint, ["subsystem", "ee", "context-service", contextServices.update.name], {
          "jndi-name": contextServices.update["jndi-name"],
        });
        cy.addAddress(managementEndpoint, ["subsystem", "ee", "context-service", contextServices.remove.name], {
          "jndi-name": contextServices.remove["jndi-name"],
        });
        cy.addAddress(managementEndpoint, ["subsystem", "ee", "context-service", contextServices.reset.name], {
          "jndi-name": contextServices.reset["jndi-name"],
        });
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Context Service", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-context-service").click();
    cy.addInTable(contextServicesTable);
    cy.text("ee-service-context-service-add", "name", contextServices.create.name);
    cy.text("ee-service-context-service-add", "jndi-name", contextServices.create["jndi-name"]);
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, ["subsystem", "ee", "context-service", contextServices.create.name], true);
  });

  it("Edit jndi-name", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-context-service").click();
    cy.selectInTable(contextServicesTable, contextServices.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "jndi-name", "java:jboss/updated");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "context-service", contextServices.update.name],
      "jndi-name",
      "java:jboss/updated"
    );
  });

  it("Remove Context Service", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-context-service").click();
    cy.removeFromTable(contextServicesTable, contextServices.remove.name);
    cy.verifySuccess();
    cy.validateAddress(managementEndpoint, ["subsystem", "ee", "context-service", contextServices.remove.name], false);
  });
});
