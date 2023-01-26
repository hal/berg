describe("TESTS: Configuration => Subsystem => EE => Services => Thread Factories", () => {
  let managementEndpoint: string;

  const configurationFormId = "ee-service-thread-factories-form";
  const managedThreadFactoriesTableId = "ee-service-thread-factories-table";

  const contextServices = {
    update: {
      name: "context-service-to-update",
      "jndi-name": "java:jboss/jndiToUpdate",
    },
  };

  const threadFactories = {
    create: {
      name: "managed-thread-factory-to-create",
      "jndi-name": "java:jboss/mtfToCreate",
    },
    update: {
      name: "managed-thread-factory-to-update",
      "jndi-name": "java:jboss/mtfToUpdate",
    },
    reset: {
      name: "managed-thread-factory-to-reset",
      "jndi-name": "java:jboss/mtfToReset",
    },
    remove: {
      name: "managed-thread-factory-to-remove",
      "jndi-name": "java:jboss/mtfToRemove",
    },
  };

  before(() => {
    cy.startWildflyContainer()
      .then((result) => {
        managementEndpoint = result as string;
      })
      .then(() => {
        cy.addAddress(
          managementEndpoint,
          ["subsystem", "ee", "context-service", contextServices.update.name],
          {
            "jndi-name": contextServices.update["jndi-name"],
          }
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "ee",
            "managed-thread-factory",
            threadFactories.update.name,
          ],
          {
            "jndi-name": threadFactories.update["jndi-name"],
          }
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "ee",
            "managed-thread-factory",
            threadFactories.reset.name,
          ],
          {
            "jndi-name": threadFactories.reset["jndi-name"],
          }
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "ee",
            "managed-thread-factory",
            threadFactories.remove.name,
          ],
          {
            "jndi-name": threadFactories.remove["jndi-name"],
          }
        );
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Thread Factory", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-thread-factories").click();
    cy.addInTable(managedThreadFactoriesTableId);
    cy.text(
      "ee-service-thread-factories-add",
      "name",
      threadFactories.create.name
    );
    cy.text(
      "ee-service-thread-factories-add",
      "jndi-name",
      threadFactories.create["jndi-name"]
    );
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "ee",
        "managed-thread-factory",
        threadFactories.create.name,
      ],
      true
    );
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-thread-factories").click();
    cy.selectInTable(managedThreadFactoriesTableId, threadFactories.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, [
      "subsystem",
      "ee",
      "managed-thread-factory",
      threadFactories.reset.name,
    ]);
  });

  it("Remove Thread Factory", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-thread-factories").click();
    cy.removeFromTable(
      managedThreadFactoriesTableId,
      threadFactories.remove.name
    );
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      [
        "subsystem",
        "ee",
        "managed-thread-factory",
        threadFactories.remove.name,
      ],
      false
    );
  });

  it("Edit context-service", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-thread-factories").click();
    cy.selectInTable(
      managedThreadFactoriesTableId,
      threadFactories.update.name
    );
    cy.editForm(configurationFormId);
    cy.text(
      configurationFormId,
      "context-service",
      contextServices.update.name
    );
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "ee",
        "managed-thread-factory",
        threadFactories.update.name,
      ],
      "context-service",
      contextServices.update.name
    );
  });

  it("Edit jndi-name", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-thread-factories").click();
    cy.selectInTable(
      managedThreadFactoriesTableId,
      threadFactories.update.name
    );
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "jndi-name", "java:jboss/updatedJndiName");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "ee",
        "managed-thread-factory",
        threadFactories.update.name,
      ],
      "jndi-name",
      "java:jboss/updatedJndiName"
    );
  });

  it("Edit priority", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-thread-factories").click();
    cy.selectInTable(
      managedThreadFactoriesTableId,
      threadFactories.update.name
    );
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "priority", "3");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      [
        "subsystem",
        "ee",
        "managed-thread-factory",
        threadFactories.update.name,
      ],
      "priority",
      3
    );
  });
});
