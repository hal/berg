describe("TESTS: Configuration => Subsystem => EE => Services => Executor", () => {
  let managementEndpoint: string;

  const configurationFormId = "ee-service-executor-form";
  const managedExecutorServiceTableId = "ee-service-executor-table";

  const contextServices = {
    update: {
      name: "context-service-to-update",
      "jndi-name": "java:jboss/jndiToUpdate",
    },
  };

  const executors = {
    create: {
      name: "managed-executor-service-to-create",
      "jndi-name": "java:jboss/mesToCreate",
    },
    update: {
      name: "managed-executor-service-to-update",
      "jndi-name": "java:jboss/mesToUpdate",
    },
    reset: {
      name: "managed-executor-service-to-reset",
      "jndi-name": "java:jboss/mesToReset",
    },
    remove: {
      name: "managed-executor-service-to-remove",
      "jndi-name": "java:jboss/mesToRemove",
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
            "managed-executor-service",
            executors.update.name,
          ],
          {
            "jndi-name": executors.update["jndi-name"],
          }
        );
        cy.addAddress(
          managementEndpoint,
          ["subsystem", "ee", "managed-executor-service", executors.reset.name],
          {
            "jndi-name": executors.reset["jndi-name"],
          }
        );
        cy.addAddress(
          managementEndpoint,
          [
            "subsystem",
            "ee",
            "managed-executor-service",
            executors.remove.name,
          ],
          {
            "jndi-name": executors.remove["jndi-name"],
          }
        );
      });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Create Executor", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.addInTable(managedExecutorServiceTableId);
    cy.text("ee-service-executor-add", "name", executors.create.name);
    cy.text(
      "ee-service-executor-add",
      "jndi-name",
      executors.create["jndi-name"]
    );
    cy.get(
      'div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")'
    ).click();
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.create.name],
      true
    );
  });

  it("Reset", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.reset.name);
    cy.resetForm(configurationFormId, managementEndpoint, [
      "subsystem",
      "ee",
      "managed-executor-service",
      executors.reset.name,
    ]);
  });

  it("Remove Executor", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.removeFromTable(managedExecutorServiceTableId, executors.remove.name);
    cy.verifySuccess();
    cy.validateAddress(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.remove.name],
      false
    );
  });

  it("Edit context-service", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
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
      ["subsystem", "ee", "managed-executor-service", executors.update.name],
      "context-service",
      contextServices.update.name
    );
  });

  it("Edit core-threads", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "core-threads", "3");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.update.name],
      "core-threads",
      3
    );
  });

  it("Edit hung-task-termination-period", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "hung-task-termination-period", "3000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.update.name],
      "hung-task-termination-period",
      3000
    );
  });

  it("Edit hung-task-threshold", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "hung-task-threshold", "3000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.update.name],
      "hung-task-threshold",
      3000
    );
  });

  it("Edit jndi-name", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "jndi-name", "java:jboss/updatedJndiName");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.update.name],
      "jndi-name",
      "java:jboss/updatedJndiName"
    );
  });

  it("Edit keepalive-time", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "keepalive-time", "3000");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.update.name],
      "keepalive-time",
      3000
    );
  });

  it("Toggle long-running-tasks", () => {
    let value = false;
    cy.task("execute:cli", {
      managementApi: managementEndpoint + "/management",
      operation: "read-attribute",
      address: [
        "subsystem",
        "ee",
        "managed-executor-service",
        executors.update.name,
      ],
      name: "long-running-tasks",
    }).then((result) => {
      value = (result as { result: boolean }).result;
      cy.navigateTo(managementEndpoint, "ee");
      cy.get("#ee-services-item").click();
      cy.get("#ee-service-executor").click();
      cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
      cy.editForm(configurationFormId);
      cy.flip(configurationFormId, "long-running-tasks", value);
      cy.saveForm(configurationFormId);
      cy.verifySuccess();
      cy.verifyAttribute(
        managementEndpoint,
        ["subsystem", "ee", "managed-executor-service", executors.update.name],
        "long-running-tasks",
        !value
      );
    });
  });

  it("Edit max-threads", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "max-threads", "3");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.update.name],
      "max-threads",
      3
    );
  });

  it("Edit queue-length", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "queue-length", "3");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.update.name],
      "queue-length",
      3
    );
  });

  it("Edit reject-policy", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
    cy.editForm(configurationFormId);
    cy.formInput(configurationFormId, "reject-policy").select("RETRY_ABORT", {
      force: true,
    });
    cy.formInput(configurationFormId, "reject-policy").trigger("change", {
      force: true,
    });
    cy.formInput(configurationFormId, "reject-policy").should(
      "have.value",
      "RETRY_ABORT"
    );
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.update.name],
      "reject-policy",
      "RETRY_ABORT"
    );
  });

  it("Edit thread-priority", () => {
    cy.navigateTo(managementEndpoint, "ee");
    cy.get("#ee-services-item").click();
    cy.get("#ee-service-executor").click();
    cy.selectInTable(managedExecutorServiceTableId, executors.update.name);
    cy.editForm(configurationFormId);
    cy.text(configurationFormId, "thread-priority", "3");
    cy.saveForm(configurationFormId);
    cy.verifySuccess();
    cy.verifyAttribute(
      managementEndpoint,
      ["subsystem", "ee", "managed-executor-service", executors.update.name],
      "thread-priority",
      3
    );
  });
});
